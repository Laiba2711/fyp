import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiChevronRight } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';

// Tailwind-based chatbot; minimal inline styles for keyframes

const API_BASE = 'http://localhost:5000/api/chat';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize session and load chat history
  useEffect(() => {
    // Generate unique session ID for guest users
    const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`chat_${id}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial greeting
      setMessages([
        {
          _id: 'greeting',
          message: "👋 Hello! Welcome to Luxury Wear customer support. How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }

    // Load initial suggestions
    loadFAQSuggestions();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Load initial FAQ suggestions
  const loadFAQSuggestions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/faqs?limit=3`);
      setSuggestions(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error loading FAQs:', error);
    }
  };

  // Send message to chatbot
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      _id: `user_${Date.now()}`,
      message: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setIsTyping(true);
    setButtons([]);
    setSuggestions([]);

    try {
      // Check if message is about order tracking
      const isOrderTracking = ['track', 'order', 'where', 'status', 'shipping', 'delivery'].some(
        keyword => inputValue.toLowerCase().includes(keyword)
      );

      if (isOrderTracking) {
        // Handle order tracking
        const trackResponse = await axios.post(`${API_BASE}/track-order`, {
          message: inputValue,
          sessionId,
          userId: null, // Set to user ID if logged in
        });

        setIsTyping(false);

        if (trackResponse.data.hasOrderId && trackResponse.data.found) {
          // Order found - show tracking info
          const botMessage = {
            _id: `bot_${Date.now()}`,
            message: trackResponse.data.tracking,
            sender: 'bot',
            timestamp: new Date(),
            messageType: 'order_tracking',
          };
          setMessages(prev => [...prev, botMessage]);
          setButtons(trackResponse.data.buttons || []);
        } else {
          // No order ID or not found
          const botMessage = {
            _id: `bot_${Date.now()}`,
            message: trackResponse.data.prompt || trackResponse.data.message,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
          if (trackResponse.data.action === 'ask_order_id') {
            // Show order input form
            showOrderInputForm();
          }
        }

        setLoading(false);
        inputRef.current?.focus();
        return;
      }

      // Regular message to FAQ matching
      const response = await axios.post(`${API_BASE}/message`, {
        message: inputValue,
        sessionId,
      });

      if (response.data.messages) {
        const botMessage = response.data.messages[1];
        setTimeout(() => {
          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);
        }, 500);
      }

      if (response.data.buttons) {
        setButtons(response.data.buttons);
      }

      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage = {
        _id: `error_${Date.now()}`,
        message: "Sorry, I encountered an error. Please try again or create a support ticket.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  // Show order input form
  const showOrderInputForm = () => {
    setMessages(prev => [
      ...prev,
      {
        _id: 'order_form',
        message: <OrderInputForm sessionId={sessionId} onSubmit={handleOrderSubmit} />,
        sender: 'bot',
        timestamp: new Date(),
        isComponent: true,
      },
    ]);
  };

  // Handle order submit from form
  const handleOrderSubmit = async (orderId) => {
    setInputValue(orderId);
    setTimeout(() => {
      const form = inputRef.current?.closest('form');
      form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  // Handle quick reply buttons
  const handleQuickReply = (buttonLabel, action) => {
    setInputValue(buttonLabel);
    
    // Special handling for certain actions
    if (action === 'create_ticket') {
      showTicketForm();
    } else if (action === 'clear_chat') {
      clearChat();
    } else {
      // Send as message
      setTimeout(() => {
        const form = inputRef.current?.closest('form');
        form?.dispatchEvent(new Event('submit', { bubbles: true }));
      }, 100);
    }
  };

  // Handle FAQ suggestion clicks
  const handleFAQSuggestion = (faq) => {
    setInputValue(faq.question);
    setTimeout(() => {
      const form = inputRef.current?.closest('form');
      form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  // Mark FAQ as helpful/unhelpful
  const markFAQHelpful = async (faqId, helpful) => {
    try {
      await axios.post(`${API_BASE}/faq/${faqId}/helpful`, { helpful });
      toast.success(helpful ? 'Thanks for the feedback!' : 'We\'ll improve this answer');
    } catch (error) {
      console.error('Error marking FAQ:', error);
    }
  };

  // Show ticket form
  const showTicketForm = () => {
    setMessages(prev => [
      ...prev,
      {
        _id: 'ticket_form',
        message: <TicketForm sessionId={sessionId} onClose={() => {}} onSubmit={(ticket) => {}} />,
        sender: 'bot',
        timestamp: new Date(),
        isComponent: true,
      },
    ]);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        _id: 'greeting',
        message: "👋 Hello! Welcome to Luxury Wear customer support. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    localStorage.removeItem(`chat_${sessionId}`);
    setButtons([]);
    setSuggestions([]);
    setInputValue('');
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes typing {
          0%,60%,100% { transform: translateY(0); opacity:0.6; }
          30% { transform: translateY(-8px); opacity:1; }
        }
      `}</style>

      {/* Chat Icon Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 text-white flex items-center justify-center shadow-lg hover:scale-110 transform transition z-50"
        >
          <FiMessageCircle size={24} />
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-1.5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[600px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 transform transition-all duration-300 ease-out animate-[slideUp_0.3s_ease]">
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white p-5 rounded-t-2xl flex justify-between items-start min-h-[70px]">
            <div className="flex-1">
              <h3 className="m-0 text-base font-semibold flex items-center gap-2">
                <MdAutoAwesome /> Luxury Care
              </h3>
              <p className="mt-1 text-xs opacity-90">AI-Powered Support</p>
            </div>
            <button
              className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center justify-center rounded-md transition-colors hover:bg-white/20"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-100">
            {messages.map(msg => {
              const containerClasses = `flex flex-col mb-1 ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              } ${msg.isComponent ? 'items-stretch' : ''}`;
              
              const contentClasses = msg.messageType === 'order_tracking'
                ? 'p-4 rounded-xl max-w-[90%] break-words shadow-sm bg-blue-50 text-gray-800 rounded-bl-sm border-l-4 border-indigo-500'
                : `p-3 rounded-xl max-w-[80%] break-words shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-700 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm'
                  }`;
              
              const timeClasses = `text-[11px] opacity-60 mt-1 px-1 ${
                msg.sender === 'user' ? 'text-indigo-500' : 'text-gray-500'
              }`;

              return (
                <div key={msg._id} className={containerClasses}>
                  {msg.isComponent ? (
                    msg.message
                  ) : (
                    <>
                      <div className={contentClasses}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className={timeClasses}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col mb-1 items-start">
                <div className="flex items-center gap-1 p-3 bg-white rounded-xl rounded-bl-sm shadow-sm">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-[typing_1.4s_infinite]"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-[typing_1.4s_infinite] delay-200"></span>
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-[typing_1.4s_infinite] delay-400"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !buttons.length && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <p className="m-0 text-xs font-semibold uppercase text-gray-500 tracking-wide">Quick answers:</p>
              <div className="flex flex-col gap-1 mt-2">
                {suggestions.map(faq => (
                  <button
                    key={faq._id}
                    onClick={() => handleFAQSuggestion(faq)}
                    className="group w-full flex justify-between items-center bg-transparent border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 hover:border-indigo-500 hover:text-indigo-500"
                  >
                    {faq.question}
                    <FiChevronRight className="opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Reply Buttons */}
          {buttons.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-white">
              <p className="m-0 text-xs font-semibold text-gray-500 uppercase tracking-wide">What would you like to do?</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(btn.label, btn.action)}
                    className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2 p-3 border-t border-gray-200 bg-white">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="bg-gradient-to-br from-indigo-500 to-purple-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </form>

          {/* Footer */}
          <div className="p-2 text-center border-t border-gray-200 bg-gray-100 rounded-b-2xl">
            <p className="m-0 text-[11px] text-gray-400">Powered by AI • Response time &lt;5s</p>
          </div>
        </div>
      )}
    </>
  );
};

// Ticket Form Component
const TicketForm = ({ sessionId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'order_issue',
    guestEmail: '',
    guestName: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (attachment) {
        data.append('attachments', attachment);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      // use chatAPI helper for unified ticket creation
      const response = await chatAPI.createTicket(data);
      toast.success('Support ticket created successfully!');
      onSubmit(response.data);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl flex flex-col gap-3 max-w-full">
      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Your Name *</label>
        <input
          type="text"
          name="guestName"
          value={formData.guestName}
          onChange={handleChange}
          placeholder="Enter your name"
          required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Email *</label>
        <input
          type="email"
          name="guestEmail"
          value={formData.guestEmail}
          onChange={handleChange}
          placeholder="your@email.com"
          required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="order_issue">Order Issue</option>
          <option value="payment_issue">Payment Issue</option>
          <option value="refund">Refund</option>
          <option value="technical_issue">Technical Issue</option>
          <option value="general">General Inquiry</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Subject *</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Brief subject"
          required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your issue in detail..."
          rows="4"
          required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-vertical"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[13px] font-semibold text-gray-800">Attachment (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAttachment(e.target.files[0])}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-gradient-to-br from-indigo-500 to-purple-700 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating...' : 'Create Ticket'}
        </button>
      </div>
    </form>
  );
};

// Order Input Form Component
const OrderInputForm = ({ sessionId, onSubmit }) => {
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter your order ID');
      return;
    }

    setSubmitting(true);
    onSubmit(orderId);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl flex flex-col gap-3 max-w-full">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-1">
          <span>📦</span> Order ID
        </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g., 507f1f77bcf86cd799439011"
          disabled={submitting}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
          autoFocus
        />
        <p className="text-xs text-gray-500">You'll find it in your confirmation email</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={submitting}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-indigo-500 to-purple-700 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Tracking...' : 'Track Order'}
        </button>
      </div>
    </form>
  );
};

export default Chatbot;
