// Mock product data for demonstration purposes
const mockProducts = [
  {
    _id: '1',
    name: 'Premium Cotton Oxford Shirt',
    description: 'Classic oxford shirt made from 100% premium cotton. Perfect for formal and casual occasions.',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800'],
    category: 'men',
    subcategory: 'shirts',
    brand: 'StyleHub',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', code: '#FFFFFF' }],
    stock: 50,
    featured: true,
    rating: 4.5,
    numReviews: 12,
    tags: ['formal', 'cotton', 'office wear']
  },
  {
    _id: '2',
    name: 'Slim Fit Denim Jeans',
    description: 'Modern slim fit jeans with premium stretch denim.',
    price: 3999,
    originalPrice: 4999,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    category: 'men',
    subcategory: 'jeans',
    brand: 'DenimCo',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Dark Blue', code: '#00008B' }],
    stock: 75,
    featured: true,
    rating: 4.2,
    numReviews: 8,
    tags: ['casual', 'denim', 'everyday']
  },
  {
    _id: '3',
    name: 'Floral Print Maxi Dress',
    description: 'Elegant floral maxi dress perfect for summer occasions.',
    price: 4499,
    originalPrice: 5999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    category: 'women',
    subcategory: 'dresses',
    brand: 'Elegance',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Floral Pink', code: '#FFB6C1' }],
    stock: 40,
    featured: true,
    rating: 4.7,
    numReviews: 15,
    tags: ['summer', 'floral', 'elegant']
  },
  {
    _id: '4',
    name: 'Kids Cartoon Print T-Shirt',
    description: 'Fun and colorful cartoon printed t-shirt for kids.',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800'],
    category: 'kids',
    subcategory: 'tshirts',
    brand: 'KidsJoy',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Yellow', code: '#FFFF00' }],
    stock: 100,
    featured: true,
    rating: 4.0,
    numReviews: 6,
    tags: ['kids', 'cartoon', 'fun']
  },
  {
    _id: '5',
    name: 'Classic Sneakers',
    description: 'Comfortable everyday sneakers with cushioned sole.',
    price: 4999,
    originalPrice: 6499,
    discount: 23,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    category: 'footwear',
    subcategory: 'sneakers',
    brand: 'StepUp',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', code: '#FFFFFF' }],
    stock: 65,
    featured: true,
    rating: 4.3,
    numReviews: 9,
    tags: ['sneakers', 'comfortable', 'everyday']
  },
  {
    _id: '6',
    name: 'Leather Belt',
    description: 'Genuine leather belt with classic buckle.',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'],
    category: 'accessories',
    subcategory: 'belts',
    brand: 'LeatherCraft',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Brown', code: '#8B4513' }],
    stock: 70,
    featured: false,
    rating: 4.1,
    numReviews: 7,
    tags: ['leather', 'formal', 'classic']
  }
];

// Mock API functions
export const mockProductsAPI = {
  getAll: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    let filteredProducts = [...mockProducts];
    
    // Apply filters
    if (params.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    if (params.minPrice || params.maxPrice) {
      filteredProducts = filteredProducts.filter(p => {
        if (params.minPrice && p.price < Number(params.minPrice)) return false;
        if (params.maxPrice && p.price > Number(params.maxPrice)) return false;
        return true;
      });
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.featured === 'true') {
      filteredProducts = filteredProducts.filter(p => p.featured);
    }
    
    // Apply sorting
    let sortField = 'createdAt';
    let sortOrder = -1; // descending
    
    switch (params.sort) {
      case 'price-asc':
        sortField = 'price';
        sortOrder = 1;
        break;
      case 'price-desc':
        sortField = 'price';
        sortOrder = -1;
        break;
      case 'newest':
        sortField = 'createdAt';
        sortOrder = -1;
        break;
      case 'rating':
        sortField = 'rating';
        sortOrder = -1;
        break;
    }
    
    filteredProducts.sort((a, b) => {
      if (sortOrder === 1) {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });
    
    // Apply pagination
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: {
        products: paginatedProducts,
        page,
        pages: Math.ceil(filteredProducts.length / limit),
        total: filteredProducts.length
      }
    };
  },
  
  getFeatured: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: mockProducts.filter(p => p.featured).slice(0, 8)
    };
  },
  
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p._id === id);
    return {
      data: product || null
    };
  },
  
  getRecommendations: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p._id === id);
    if (!product) return { data: [] };
    
    const recommendations = mockProducts
      .filter(p => p._id !== id && p.category === product.category)
      .slice(0, 6);
      
    return { data: recommendations };
  },
  
  getCategoriesWithStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const categories = {};
    mockProducts.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          count: 0,
          minPrice: Infinity,
          maxPrice: 0,
          totalValue: 0
        };
      }
      
      categories[product.category].count++;
      categories[product.category].minPrice = Math.min(categories[product.category].minPrice, product.price);
      categories[product.category].maxPrice = Math.max(categories[product.category].maxPrice, product.price);
      categories[product.category].totalValue += product.price;
    });
    
    return {
      data: Object.entries(categories).map(([name, stats]) => ({
        _id: name,
        count: stats.count,
        avgPrice: Math.round(stats.totalValue / stats.count),
        minPrice: stats.minPrice,
        maxPrice: stats.maxPrice
      }))
    };
  },
  
  getPriceStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const prices = mockProducts.map(p => p.price);
    const total = prices.reduce((sum, price) => sum + price, 0);
    
    return {
      data: {
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        avgPrice: Math.round(total / prices.length),
        totalProducts: mockProducts.length
      }
    };
  }
};

export default mockProductsAPI;