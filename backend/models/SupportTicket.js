const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  guest: {
    name: String,
    email: String,
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  category: {
    type: String,
    enum: ['order_issue', 'payment_issue', 'refund', 'technical_issue', 'general'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  attachments: [{
    filename: String,
    url: String,
  }],
  // messages now stored in separate collection for scalability
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketMessage',
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolution: {
    type: String,
  },
  resolutionDate: Date,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: String,
}, {
  timestamps: true,
});

// Index for faster queries
supportTicketSchema.index({ user: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
