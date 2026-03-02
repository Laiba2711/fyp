const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    unique: true,
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer'],
  },
  category: {
    type: String,
    enum: ['general', 'shipping', 'returns', 'payment', 'products', 'account', 'orders'],
    default: 'general',
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  priority: {
    type: Number,
    default: 1, // Higher number = higher priority
  },
  views: {
    type: Number,
    default: 0,
  },
  helpfulCount: {
    type: Number,
    default: 0,
  },
  unhelpfulCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster searching
faqSchema.index({ keywords: 1 });
faqSchema.index({ category: 1 });
faqSchema.index({ isActive: 1 });

module.exports = mongoose.model('FAQ', faqSchema);
