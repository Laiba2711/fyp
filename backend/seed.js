const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '+92 300 1234567',
    address: {
      street: '123 Admin Street',
      city: 'Faisalabad',
      state: 'Punjab',
      zipCode: '38000',
      country: 'Pakistan',
    },
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
    phone: '+92 301 2345678',
    address: {
      street: '456 User Avenue',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan',
    },
  },
];

const products = [
  // Men's Category
  {
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
    tags: ['formal', 'cotton', 'office wear', 'classic'],
  },
  {
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
    tags: ['casual', 'denim', 'everyday', 'trendy'],
  },
  {
    name: 'Classic Polo T-Shirt',
    description: 'Timeless polo shirt crafted from breathable pique cotton. Features ribbed collar and cuffs with embroidered logo.',
    price: 1899,
    originalPrice: 2499,
    discount: 24,
    images: ['https://images.unsplash.com/photo-1625910513413-5fc9b5178865?w=800'],
    category: 'men',
    subcategory: 'tshirts',
    brand: 'StyleHub',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Navy', code: '#000080' }, { name: 'Red', code: '#FF0000' }, { name: 'Green', code: '#008000' }],
    stock: 100,
    featured: false,
    tags: ['casual', 'polo', 'classic', 'comfortable'],
  },
  {
    name: 'Formal Blazer',
    description: 'Elegant single-breasted blazer perfect for business meetings and formal events. Made with premium wool blend.',
    price: 8999,
    originalPrice: 12999,
    discount: 31,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
    category: 'men',
    subcategory: 'blazers',
    brand: 'Executive',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Charcoal', code: '#36454F' }, { name: 'Navy Blue', code: '#000080' }],
    stock: 25,
    featured: true,
    tags: ['formal', 'business', 'premium', 'elegant'],
  },

  // Women's Category
  {
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
    tags: ['summer', 'floral', 'elegant', 'party'],
  },
  {
    name: 'High-Waist Palazzo Pants',
    description: 'Comfortable wide-leg palazzo pants with high waist design. Perfect for office or casual outings.',
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'],
    category: 'women',
    subcategory: 'pants',
    brand: 'ChicStyle',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', code: '#000000' }, { name: 'Beige', code: '#F5F5DC' }],
    stock: 60,
    featured: false,
    tags: ['office', 'comfortable', 'elegant', 'trendy'],
  },
  {
    name: 'Embroidered Kurti',
    description: 'Beautiful hand-embroidered kurti with traditional Pakistani designs. Made from premium lawn fabric.',
    price: 3499,
    originalPrice: 4499,
    discount: 22,
    images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'],
    category: 'women',
    subcategory: 'kurtis',
    brand: 'Heritage',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', code: '#FFFFFF' }, { name: 'Maroon', code: '#800000' }],
    stock: 45,
    featured: true,
    tags: ['traditional', 'embroidered', 'cultural', 'elegant'],
  },
  {
    name: 'Silk Scarf',
    description: 'Luxurious pure silk scarf with beautiful patterns. Perfect accessory for any outfit.',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    images: ['https://images.unsplash.com/photo-1601924774924-9b30c9e66c50?w=800'],
    category: 'women',
    subcategory: 'scarves',
    brand: 'LuxeWear',
    sizes: ['Free Size'],
    colors: [{ name: 'Multi', code: '#FF69B4' }],
    stock: 80,
    featured: false,
    tags: ['silk', 'luxury', 'accessory', 'elegant'],
  },

  // Kids Category
  {
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
    tags: ['kids', 'cartoon', 'fun', 'comfortable'],
  },
  {
    name: 'Kids Denim Dungaree',
    description: 'Adorable denim dungaree for little ones. Durable and comfortable with adjustable straps.',
    price: 1799,
    originalPrice: 2499,
    discount: 28,
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
    category: 'kids',
    subcategory: 'dungarees',
    brand: 'KidsJoy',
    sizes: ['XS', 'S', 'M'],
    colors: [{ name: 'Blue Denim', code: '#4169E1' }],
    stock: 50,
    featured: false,
    tags: ['kids', 'denim', 'cute', 'durable'],
  },

  // Accessories
  {
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
    tags: ['leather', 'formal', 'classic', 'essential'],
  },
  {
    name: 'Classic Sunglasses',
    description: 'Stylish UV protection sunglasses with metal frame. Timeless design for all face shapes.',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'],
    category: 'accessories',
    subcategory: 'sunglasses',
    brand: 'VisionStyle',
    sizes: ['Free Size'],
    colors: [{ name: 'Gold', code: '#FFD700' }, { name: 'Silver', code: '#C0C0C0' }],
    stock: 55,
    featured: true,
    tags: ['sunglasses', 'UV protection', 'fashion', 'summer'],
  },
  {
    name: 'Canvas Backpack',
    description: 'Durable canvas backpack with multiple compartments. Perfect for everyday use and travel.',
    price: 2999,
    originalPrice: 3999,
    discount: 25,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    category: 'accessories',
    subcategory: 'bags',
    brand: 'TravelGear',
    sizes: ['Free Size'],
    colors: [{ name: 'Khaki', code: '#F0E68C' }, { name: 'Navy', code: '#000080' }],
    stock: 40,
    featured: false,
    tags: ['backpack', 'travel', 'durable', 'spacious'],
  },

  // Footwear
  {
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
    tags: ['sneakers', 'comfortable', 'everyday', 'sporty'],
  },
  {
    name: 'Formal Leather Shoes',
    description: 'Premium leather formal shoes with elegant design. Perfect for business and special occasions.',
    price: 6999,
    originalPrice: 8999,
    discount: 22,
    images: ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800'],
    category: 'footwear',
    subcategory: 'formal',
    brand: 'ClassicStep',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', code: '#000000' }, { name: 'Brown', code: '#8B4513' }],
    stock: 35,
    featured: true,
    tags: ['formal', 'leather', 'elegant', 'business'],
  },
  {
    name: 'Women Heels',
    description: 'Elegant high heels for special occasions. Comfortable with cushioned insole.',
    price: 3999,
    originalPrice: 5499,
    discount: 27,
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800'],
    category: 'footwear',
    subcategory: 'heels',
    brand: 'GlamStep',
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Red', code: '#FF0000' }, { name: 'Black', code: '#000000' }],
    stock: 30,
    featured: false,
    tags: ['heels', 'elegant', 'party', 'glamorous'],
  },
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    console.log('Data cleared...');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);

    console.log('Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
