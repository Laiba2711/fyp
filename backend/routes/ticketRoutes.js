const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const TicketMessage = require('../models/TicketMessage');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @desc    Create a new support ticket (customer side)
// @route   POST /api/tickets
// @access  Public (with optional user)
router.post('/', upload.array('attachments', 3), async (req, res) => {
  try {
    const { subject, description, category, orderId } = req.body;
    const userId = req.user?._id || null;
    const guestEmail = req.body.email || null;
    const guestName = req.body.name || null;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const ticketData = {
      subject,
      description,
      category: category || 'general',
      user: userId,
      guest: userId ? undefined : { name: guestName, email: guestEmail },
      orderId: orderId || undefined,
    };

    if (req.files && req.files.length) {
      ticketData.attachments = req.files.map(file => ({ filename: file.filename, url: `/uploads/tickets/${file.filename}` }));
    }

    const ticket = await SupportTicket.create(ticketData);

    // initial message
    if (ticket) {
      const msg = await TicketMessage.create({
        ticket: ticket._id,
        sender: userId ? 'user' : 'user',
        message: description,
      });
      ticket.messages.push(msg._id);
      await ticket.save();
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    List tickets (admin view)
// @route   GET /api/tickets
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, assignedTo, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    const total = await SupportTicket.countDocuments(query);
    res.json({ tickets, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a specific ticket with messages
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // allow only owner or admin
    if (ticket.user && req.user && ticket.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await TicketMessage.find({ ticket: ticket._id }).sort({ createdAt: 1 });
    res.json({ ticket, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update ticket status / assign / resolution
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, assignedTo, resolution } = req.body;
    const update = {};
    if (status) update.status = status;
    if (assignedTo) update.assignedTo = assignedTo;
    if (resolution) {
      update.resolution = resolution;
      update.resolutionDate = new Date();
    }

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a message to ticket thread
// @route   POST /api/tickets/:id/message
// @access  Private
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // permission check
    if (ticket.user && ticket.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const msg = await TicketMessage.create({
      ticket: ticket._id,
      sender: req.user.isAdmin ? 'admin' : 'user',
      message,
    });
    ticket.messages.push(msg._id);
    await ticket.save();

    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;