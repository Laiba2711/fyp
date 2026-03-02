const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Can be null for guest users
  },
  guest: {
    // For guest users without authentication
    email: String,
    sessionId: String, // Unique session ID for guest
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    trim: true,
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'faq', 'ticket', 'option'],
    default: 'text',
  },
  faqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQ',
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
  },
  metadata: {
    // For storing additional data like order tracking
    orderId: String,
    matchScore: Number, // Confidence score for FAQ matches
    suggestedFAQs: [String], // Fallback FAQ suggestions
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ guest: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
