// Simple in-memory server for product API demonstration
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Sample product data
const products = [
  {
    _id: '1',
    name: 'Premium Cotton Oxford Shirt',
    description: 'Classic oxford shirt made from 100% premium cotton. Perfect for formal and casual occasions. Features a comfortable regular fit with button-down collar.',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'],
    category: 'men',
    subcategory: 'shirts',
    brand: 'StyleHub',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', code: '#FFFFFF' }, { name: 'Light Blue', code: '#ADD8E6' }],
    stock: 50,
    featured: true,
    rating: 4.5,
    numReviews: 12,
    tags: ['formal', 'cotton', 'office wear', 'classic'],
    createdAt: new Date(Date.now() - 86400000), // yesterday
  },
  {
    _id: '2',
    name: 'Slim Fit Denim Jeans',
    description: 'Modern slim fit jeans with premium stretch denim. Comfortable all-day wear with classic 5-pocket styling.',
    price: 3999,
    originalPrice: 4999,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
    category: 'men',
    subcategory: 'jeans',
    brand: 'DenimCo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Dark Blue', code: '#00008B' }, { name: 'Black', code: '#000000' }],
    stock: 75,
    featured: true,
    rating: 4.2,
    numReviews: 8,
    tags: ['casual', 'denim', 'everyday', 'trendy'],
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    _id: '3',
    name: 'Floral Print Maxi Dress',
    description: 'Elegant floral maxi dress perfect for summer occasions. Features flowing silhouette with adjustable straps.',
    price: 4499,
    originalPrice: 5999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    category: 'women',
    subcategory: 'dresses',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Floral Pink', code: '#FFB6C1' }, { name: 'Floral Blue', code: '#87CEEB' }],
    stock: 40,
    featured: true,
    rating: 4.7,
    numReviews: 15,
    tags: ['summer', 'floral', 'elegant', 'party'],
    createdAt: new Date(),
  },
  {
    _id: '4',
    name: 'Kids Cartoon Print T-Shirt',
    description: 'Fun and colorful cartoon printed t-shirt for kids. Made from soft cotton for all-day comfort.',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800'],
    category: 'kids',
    subcategory: 'tshirts',
    brand: 'KidsJoy',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Yellow', code: '#FFFF00' }, { name: 'Blue', code: '#0000FF' }, { name: 'Red', code: '#FF0000' }],
    stock: 100,
    featured: true,
    rating: 4.0,
    numReviews: 6,
    tags: ['kids', 'cartoon', 'fun', 'comfortable'],
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    _id: '5',
    name: 'Classic Sneakers',
    description: 'Comfortable everyday sneakers with cushioned sole. Perfect blend of style and comfort.',
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800'],
    category: 'footwear',
    subcategory: 'sneakers',
    brand: 'StepUp',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', code: '#FFFFFF' }, { name: 'Black', code: '#000000' }],
    stock: 65,
    featured: true,
    rating: 4.3,
    numReviews: 9,
    tags: ['sneakers', 'comfortable', 'everyday', 'sporty'],
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
  },
  {
    _id: '6',
    name: 'Leather Belt',
    description: 'Genuine leather belt with classic buckle. Essential accessory for formal and casual wear.',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'],
    category: 'accessories',
    subcategory: 'belts',
    brand: 'LeatherCraft',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Brown', code: '#8B4513' }, { name: 'Black', code: '#000000' }],
    stock: 70,
    featured: false,
    rating: 4.1,
    numReviews: 7,
    tags: ['leather', 'formal', 'classic', 'essential'],
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
  }
];

// Routes

// GET all products with filtering and pagination
app.get('/api/products', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  
  // Build filter object
  let filteredProducts = [...products];
  
  // Category filter
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => p.category === req.query.category);
  }
  
  // Price range filter
  if (req.query.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(req.query.maxPrice));
  }
  
  // Brand filter
  if (req.query.brand) {
    filteredProducts = filteredProducts.filter(p => p.brand === req.query.brand);
  }
  
  // Search filter
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Featured filter
  if (req.query.featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.featured);
  }
  
  // Sort
  let sortedProducts = [...filteredProducts];
  switch (req.query.sort) {
    case 'price-asc':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'rating':
      sortedProducts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    page,
    pages: Math.ceil(sortedProducts.length / limit),
    total: sortedProducts.length,
  });
});

// GET featured products
app.get('/api/products/featured', (req, res) => {
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  res.json(featuredProducts);
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  // Check if the ID is not one of our static routes
  const staticRoutes = ['featured', 'categories', 'price-stats', 'tag', 'brand', 'search', 'advanced'];
  if (staticRoutes.includes(req.params.id)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const product = products.find(p => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// GET products by category
app.get('/api/products/category/:category', (req, res) => {
  const categoryProducts = products.filter(p => p.category === req.params.category).slice(0, 12);
  res.json(categoryProducts);
});

// GET product recommendations
app.get('/api/products/:id/recommendations', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (product) {
    const recommendations = products.filter(p => 
      p._id !== product._id && p.category === product.category
    ).slice(0, 6);
    res.json(recommendations);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// GET categories with stats
app.get('/api/products/categories/stats', (req, res) => {
  const categories = {};
  
  products.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = {
        _id: product.category,
        count: 0,
        avgPrice: 0,
        minPrice: Infinity,
        maxPrice: 0,
        totalValue: 0
      };
    }
    
    categories[product.category].count++;
    categories[product.category].totalValue += product.price;
    categories[product.category].minPrice = Math.min(categories[product.category].minPrice, product.price);
    categories[product.category].maxPrice = Math.max(categories[product.category].maxPrice, product.price);
  });
  
  // Calculate average prices
  Object.values(categories).forEach(cat => {
    cat.avgPrice = Math.round(cat.totalValue / cat.count);
  });
  
  const result = Object.values(categories).sort((a, b) => b.count - a.count);
  res.json(result);
});

// GET price stats
app.get('/api/products/price-stats', (req, res) => {
  const prices = products.map(p => p.price);
  const total = prices.reduce((sum, price) => sum + price, 0);
  
  const stats = {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgPrice: Math.round(total / prices.length),
    totalProducts: products.length
  };
  
  res.json(stats);
});

// GET products by tag
app.get('/api/products/tag/:tag', (req, res) => {
  const tagProducts = products.filter(p => 
    p.tags.includes(req.params.tag)
  ).slice(0, 12);
  res.json(tagProducts);
});

// GET products by brand
app.get('/api/products/brand/:brand', (req, res) => {
  const brandProducts = products.filter(p => 
    p.brand === req.params.brand
  ).slice(0, 12);
  res.json(brandProducts);
});

// Advanced search
app.get('/api/products/search/advanced', (req, res) => {
  const { q, category, brand, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  let filteredProducts = [...products];
  
  // Text search
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // Category filter
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Brand filter
  if (brand) {
    filteredProducts = filteredProducts.filter(p => p.brand === brand);
  }
  
  // Price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
  }
  
  // Sorting
  filteredProducts.sort((a, b) => {
    let valA = a[sortBy], valB = b[sortBy];
    
    // Handle date comparison
    if (sortBy === 'createdAt') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  res.json(filteredProducts.slice(0, 20));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});