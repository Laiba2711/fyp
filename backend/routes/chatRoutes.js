const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const FAQ = require('../models/FAQ');
const SupportTicket = require('../models/SupportTicket');
const TicketMessage = require('../models/TicketMessage');
const Order = require('../models/Order');
const ChatBot = require('../utils/chatBot');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Send a chat message and get AI response
// @route   POST /api/chat/message
// @access  Public
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, guestEmail } = req.body;
    const userId = req.user?._id || null;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      user: userId,
      guest: !userId ? { sessionId, email: guestEmail } : undefined,
      message: message.trim(),
      sender: 'user',
      messageType: 'text',
    });

    // Handle greetings
    if (ChatBot.isGreeting(message)) {
      const botResponse = ChatBot.getGreetingResponse();
      const botMessage = await ChatMessage.create({
        user: userId,
        guest: !userId ? { sessionId, email: guestEmail } : undefined,
        message: botResponse,
        sender: 'bot',
        messageType: 'text',
      });

      return res.json({
        success: true,
        messages: [
          { _id: userMessage._id, message: userMessage.message, sender: 'user', timestamp: userMessage.createdAt },
          { _id: botMessage._id, message: botMessage.message, sender: 'bot', timestamp: botMessage.createdAt },
        ],
      });
    }

    // Try to match to FAQ
    const matchResult = await ChatBot.matchQueryToFAQ(message);

    if (matchResult.matched) {
      // FAQ matched with high confidence
      const faq = matchResult.faq;
      
      const botMessage = await ChatMessage.create({
        user: userId,
        guest: !userId ? { sessionId, email: guestEmail } : undefined,
        message: faq.answer,
        sender: 'bot',
        messageType: 'faq',
        faqId: faq._id,
        metadata: {
          matchScore: matchResult.score,
        },
      });

      // Increment FAQ views
      faq.views += 1;
      await faq.save();

      const buttons = ChatBot.getQuickReplyButtons(message);

      return res.json({
        success: true,
        messages: [
          { _id: userMessage._id, message: userMessage.message, sender: 'user', timestamp: userMessage.createdAt },
          { _id: botMessage._id, message: botMessage.message, sender: 'bot', messageType: 'faq', timestamp: botMessage.createdAt },
        ],
        buttons,
        feedback: {
          faqId: faq._id,
          question: 'Was this helpful?',
        },
      });
    }

    // No strong match - suggest FAQs and offer ticket creation
    const fallbackMessage = ChatBot.getFallbackResponse(matchResult.suggestions);
    
    const botMessage = await ChatMessage.create({
      user: userId,
      guest: !userId ? { sessionId, email: guestEmail } : undefined,
      message: fallbackMessage,
      sender: 'bot',
      messageType: 'text',
      metadata: {
        suggestedFAQs: matchResult.suggestions.map(faq => faq._id),
      },
    });

    const buttons = ChatBot.getQuickReplyButtons(message);

    res.json({
      success: true,
      messages: [
        { _id: userMessage._id, message: userMessage.message, sender: 'user', timestamp: userMessage.createdAt },
        { _id: botMessage._id, message: botMessage.message, sender: 'bot', timestamp: botMessage.createdAt },
      ],
      suggestions: matchResult.suggestions.map(faq => ({
        _id: faq._id,
        question: faq.question,
      })),
      buttons,
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ message: 'Error processing message', error: error.message });
  }
});

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { sessionId } = req.query;
    let query = {};

    if (req.user) {
      query.user = req.user._id;
    } else if (sessionId) {
      query['guest.sessionId'] = sessionId;
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('faqId', 'question answer')
      .lean();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get chat history for guests
// @route   GET /api/chat/history/:sessionId
// @access  Public
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await ChatMessage.find({ 'guest.sessionId': sessionId })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('faqId', 'question answer')
      .lean();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Mark FAQ as helpful
// @route   POST /api/chat/faq/:faqId/helpful
// @access  Public
router.post('/faq/:faqId/helpful', async (req, res) => {
  try {
    const { faqId } = req.params;
    const { helpful } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      faqId,
      {
        $inc: {
          [helpful ? 'helpfulCount' : 'unhelpfulCount']: 1,
        },
      },
      { new: true },
    );

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create support ticket from chat
// @route   POST /api/chat/ticket
// @access  Public
router.post('/ticket', upload.array('attachments', 3), async (req, res) => {
  try {
    const { subject, description, category, guestEmail, guestName, orderId } = req.body;
    const userId = req.user?._id || null;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const ticketData = {
      user: userId,
      guest: !userId ? { name: guestName, email: guestEmail } : undefined,
      subject,
      description,
      category: category || 'general',
      orderId: orderId || undefined,
      messages: [
        {
          sender: userId ? 'admin' : 'user',
          message: description,
        },
      ],
    };

    if (req.files && req.files.length) {
      ticketData.attachments = req.files.map(file => ({ filename: file.filename, url: `/uploads/tickets/${file.filename}` }));
    }

    const ticket = await SupportTicket.create(ticketData);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== FAQ MANAGEMENT ROUTES =====

// @desc    Get all active FAQs
// @route   GET /api/chat/faqs
// @access  Public
router.get('/faqs', async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ priority: -1, views: -1 })
      .select('question answer category keywords');

    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get FAQ by ID
// @route   GET /api/chat/faqs/:id
// @access  Public
router.get('/faqs/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Increment views
    faq.views += 1;
    await faq.save();

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== ADMIN ROUTES =====

// @desc    Create new FAQ (Admin)
// @route   POST /api/chat/faqs/admin/create
// @access  Private/Admin
router.post('/faqs/admin/create', protect, admin, async (req, res) => {
  try {
    const { question, answer, category, keywords, priority } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'general',
      keywords: keywords || [],
      priority: priority || 1,
    });

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update FAQ (Admin)
// @route   PUT /api/chat/faqs/:id/admin/update
// @access  Private/Admin
router.put('/faqs/:id/admin/update', protect, admin, async (req, res) => {
  try {
    const { question, answer, category, keywords, priority, isActive } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        category,
        keywords,
        priority,
        isActive,
      },
      { new: true, runValidators: true },
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete FAQ (Admin)
// @route   DELETE /api/chat/faqs/:id/admin/delete
// @access  Private/Admin
router.delete('/faqs/:id/admin/delete', protect, admin, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ message: 'FAQ deleted successfully', faq });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all support tickets (Admin)
// @route   GET /api/chat/tickets/admin
// @access  Private/Admin
router.get('/tickets/admin', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email')
      .populate('orderId', 'orderNumber totalPrice');

    const count = await SupportTicket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user's support tickets
// @route   GET /api/chat/tickets/user
// @access  Private
router.get('/tickets/user', protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'orderNumber totalPrice');

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single ticket
// @route   GET /api/chat/tickets/:id
// @access  Private
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('orderId');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // also return thread messages
    const messages = await TicketMessage.find({ ticket: ticket._id }).sort({ createdAt: 1 });
    res.json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update ticket status (Admin)
// @route   PUT /api/chat/tickets/:id/status
// @access  Private/Admin
router.put('/tickets/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution: status === 'resolved' ? resolution : undefined,
        resolutionDate: status === 'resolved' ? new Date() : undefined,
      },
      { new: true },
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== ORDER TRACKING ENDPOINTS =====

// @desc    Get order by ID (public, guest access)
// @route   GET /api/chat/order/:orderId
// @access  Public
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate order ID format
    if (!orderId || orderId.length < 5) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid order ID format. Please provide a valid order ID.' 
      });
    }

    const order = await Order.findById(orderId).select(
      'user _id status trackingNumber createdAt deliveredAt orderItems shippingAddress'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please verify your order ID and try again.',
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber || null,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt || null,
        itemCount: order.orderItems.length,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving order information. Please try again later.' 
    });
  }
});

// @desc    Get order details with full info (protected, user only)
// @route   GET /api/chat/order/:orderId/user
// @access  Private
router.get('/order/:orderId/user', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId).populate('orderItems.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Verify user ownership
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order.',
      });
    }

    // Calculate estimated delivery
    const createdDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(createdDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber || null,
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt || null,
        estimatedDelivery: order.status !== 'delivered' ? estimatedDelivery : null,
        items: order.orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: order.shippingAddress,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error retrieving order details.' 
    });
  }
});

// @desc    Track order (chatbot endpoint - detects intent and asks for order ID)
// @route   POST /api/chat/track-order
// @access  Public
router.post('/track-order', async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Extract order ID from message
    const orderId = ChatBot.extractOrderId(message);

    if (!orderId) {
      // No order ID found, ask user for it
      return res.json({
        success: true,
        hasOrderId: false,
        prompt: ChatBot.getOrderTrackingPrompt(),
        action: 'ask_order_id',
      });
    }

    // Try to fetch the order
    const order = await Order.findById(orderId).select(
      '_id status trackingNumber createdAt deliveredAt orderItems shippingAddress user totalPrice'
    );

    if (!order) {
      return res.json({
        success: true,
        hasOrderId: true,
        found: false,
        message: `Order **${orderId}** not found. Please double-check the order ID and try again.`,
        action: 'order_not_found',
      });
    }

    // Check if user has permission to view (if logged in)
    if (userId && order.user.toString() !== userId.toString()) {
      return res.json({
        success: true,
        hasOrderId: true,
        found: false,
        message: 'You do not have permission to view this order. Please verify the order ID.',
        action: 'permission_denied',
      });
    }

    // Calculate estimated delivery
    const createdDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(createdDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const trackingInfo = ChatBot.formatOrderTrackingResponse({
      ...order.toObject(),
      estimatedDeliveryDate: estimatedDelivery,
    });

    return res.json({
      success: true,
      hasOrderId: true,
      found: true,
      tracking: trackingInfo,
      action: 'order_found',
      buttons: [
        { label: 'View full details', action: 'view_order_details' },
        { label: 'Report issue', action: 'create_ticket' },
        { label: 'Track another', action: 'track_order' },
      ],
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order. Please try again later.',
    });
  }
});

module.exports = router;
