const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const SearchLog = require('../models/SearchLog');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    // Size filter
    if (req.query.size) {
      filter.sizes = req.query.size;
    }

    // Search by text
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Featured products
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    // Sort
    let sortOption = {};
    switch (req.query.sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true, isActive: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get price range statistics
// @route   GET /api/products/price-stats
// @access  Public
router.get('/price-stats', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0, totalProducts: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all categories with product counts
// @route   GET /api/products/categories
// @access  Public
router.get('/categories/stats', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Smart Search with fuzzy matching and typo tolerance
// @route   GET /api/products/smart-search
// @access  Public
router.get('/smart-search', async (req, res) => {
  try {
    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const pageSize = Number(limit);
    const skip = (Number(page) - 1) * pageSize;

    // 1. Build Base Match Filter
    const matchFilter = { isActive: true };

    // Handle Search Query
    if (q) {
      const searchTerms = q.trim().split(/\s+/);
      matchFilter.$or = [
        { $text: { $search: q } },
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        ...searchTerms.map(term => ({
          $or: [
            { name: { $regex: term.split('').join('.*'), $options: 'i' } },
            { brand: { $regex: term.split('').join('.*'), $options: 'i' } }
          ]
        }))
      ];
    }

    // Apply Advanced Filters
    if (category) matchFilter.category = category;
    if (brand) matchFilter.brand = brand;
    if (inStock === 'true') matchFilter.stock = { $gt: 0 };
    if (minRating) matchFilter.rating = { $gte: Number(minRating) };

    if (minPrice || maxPrice) {
      matchFilter.price = {};
      if (minPrice) matchFilter.price.$gte = Number(minPrice);
      if (maxPrice) matchFilter.price.$lte = Number(maxPrice);
    }

    // 2. Determine Sort Strategy
    let sortStage = { createdAt: -1 };
    if (sort === 'price-asc') sortStage = { price: 1 };
    else if (sort === 'price-desc') sortStage = { price: -1 };
    else if (sort === 'rating') sortStage = { rating: -1 };
    else if (q) sortStage = { totalScore: -1, createdAt: -1 };

    // 3. Construct and Execute Pipeline
    const pipeline = [
      { $match: matchFilter }
    ];

    // Only add score metadata if we are doing a text search
    if (q) {
      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" },
          exactMatchBoost: {
            $cond: [
              {
                $or: [
                  { $regexMatch: { input: "$name", regex: q || "", options: "i" } },
                  { $regexMatch: { input: "$brand", regex: q || "", options: "i" } }
                ]
              },
              10,
              0
            ]
          }
        }
      });
      pipeline.push({
        $addFields: {
          totalScore: { $add: [{ $ifNull: ["$score", 0] }, "$exactMatchBoost"] }
        }
      });
    }

    pipeline.push(
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: pageSize }]
        }
      }
    );

    const results = await Product.aggregate(pipeline);
    const products = results[0].data;
    const total = results[0].metadata[0]?.total || 0;

    // Log the search (Async, don't wait for it to finish)
    if (q) {
      SearchLog.create({
        query: q,
        resultsCount: total,
        user: req.user?._id || null, // req.user might be available if using optional auth
        source: 'web'
      }).catch(err => console.error('Error logging search:', err));
    }

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / pageSize),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get related products by tags
// @route   GET /api/products/tag/:tag
// @access  Public
router.get('/tag/:tag', async (req, res) => {
  try {
    const products = await Product.find({
      tags: req.params.tag,
      isActive: true
    }).limit(12);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get products by brand
// @route   GET /api/products/brand/:brand
// @access  Public
router.get('/brand/:brand', async (req, res) => {
  try {
    const products = await Product.find({
      brand: req.params.brand,
      isActive: true
    }).limit(12);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ products: [], categories: [], brands: [] });
    }

    const suggestions = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $facet: {
          products: [
            { $limit: 5 },
            { $project: { name: 1, _id: 1, image: { $arrayElemAt: ["$images", 0] }, price: 1 } }
          ],
          categories: [
            { $group: { _id: "$category" } },
            { $limit: 3 },
            { $project: { name: "$_id", _id: 0 } }
          ],
          brands: [
            { $group: { _id: "$brand" } },
            { $limit: 3 },
            { $project: { name: "$_id", _id: 0 } }
          ]
        }
      }
    ]);

    const result = suggestions[0];

    // Format popular searches (mocking with combinations of found categories and brands)
    const popular = [];
    if (result.categories.length > 0) popular.push(`${result.categories[0].name} fashion`);
    if (result.brands.length > 0) popular.push(`Latest ${result.brands[0].name}`);

    res.json({
      products: result.products,
      categories: result.categories.map(c => c.name),
      brands: result.brands.map(b => b.name),
      popular
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true
    }).limit(12);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      discount: req.body.discount,
      images: req.body.images,
      category: req.body.category,
      subcategory: req.body.subcategory,
      brand: req.body.brand,
      sizes: req.body.sizes,
      colors: req.body.colors,
      stock: req.body.stock,
      featured: req.body.featured,
      tags: req.body.tags,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price ?? product.price;
      product.originalPrice = req.body.originalPrice ?? product.originalPrice;
      product.discount = req.body.discount ?? product.discount;
      product.images = req.body.images || product.images;
      product.category = req.body.category || product.category;
      product.subcategory = req.body.subcategory || product.subcategory;
      product.brand = req.body.brand || product.brand;
      product.sizes = req.body.sizes || product.sizes;
      product.colors = req.body.colors || product.colors;
      product.stock = req.body.stock ?? product.stock;
      product.featured = req.body.featured ?? product.featured;
      product.isActive = req.body.isActive ?? product.isActive;
      product.tags = req.body.tags || product.tags;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get AI-based Smart Suggestions (Upsell / Cross-sell)
// @route   GET /api/products/:id/smart-suggestions
// @access  Public
router.get('/:id/smart-suggestions', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 1. Related Products (Same category, similar logic)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
      stock: { $gt: 0 }
    }).limit(4);

    // 2. Upgrades (Upsell - Same category, higher price, higher/equal rating)
    const upgrades = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      price: { $gt: product.price },
      rating: { $gte: product.rating },
      isActive: true,
      stock: { $gt: 0 }
    }).sort({ price: 1 }).limit(4);

    // 3. Frequently Bought Together (Cross-sell - Different category, shared tags)
    const crossSell = await Product.find({
      category: { $ne: product.category },
      isActive: true,
      stock: { $gt: 0 },
      tags: { $in: product.tags }
    }).sort({ numReviews: -1 }).limit(4);

    res.json({
      related,
      upgrades,
      crossSell
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




module.exports = router;
