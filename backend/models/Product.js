const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0,
  },
  originalPrice: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['men', 'women', 'kids', 'accessories', 'footwear'],
  },
  subcategory: {
    type: String,
  },
  brand: {
    type: String,
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
  }],
  colors: [{
    name: String,
    code: String,
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Create index for search
// Create optimized index for smart search
productSchema.index(
  {
    name: 'text',
    brand: 'text',
    category: 'text',
    tags: 'text',
    description: 'text'
  },
  {
    weights: {
      name: 10,
      brand: 5,
      category: 3,
      tags: 2,
      description: 1
    },
    name: "SmartSearchIndex"
  }
);

// Supplementary indices for optimized filtering
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
