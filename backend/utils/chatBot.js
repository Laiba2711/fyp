const FAQ = require('../models/FAQ');

// Simple NLP utility for matching customer queries to FAQs
class Chatbot {
  // Calculate similarity between two strings using Levenshtein distance
  static levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null),
    );

    for (let i = 0; i <= str1.length; i++) {
      track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator,
        );
      }
    }

    return track[str2.length][str1.length];
  }

  // Calculate string similarity (0-1)
  static calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0;
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    return 1 - distance / maxLength;
  }

  // Extract keywords from query
  static extractKeywords(query) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
    ]);

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 2);
  }

  // Check if query matches any keywords in FAQ
  static keywordMatchScore(query, faqItem) {
    const queryKeywords = this.extractKeywords(query);
    const faqKeywords = faqItem.keywords.map(k => k.toLowerCase());

    const matches = queryKeywords.filter(qk =>
      faqKeywords.some(fk => fk.includes(qk) || qk.includes(fk)),
    ).length;

    return queryKeywords.length > 0 ? matches / queryKeywords.length : 0;
  }

  // Match query to FAQs with scoring system
  static async matchQueryToFAQ(query) {
    try {
      const faqs = await FAQ.find({ isActive: true });

      const scoredFAQs = faqs.map(faq => {
        // Keyword matching (40% weight)
        const keywordScore = this.keywordMatchScore(query, faq) * 0.4;

        // Question similarity (50% weight)
        const questionSimilarity = this.calculateSimilarity(query, faq.question) * 0.5;

        // Category relevance (10% weight)
        const categoryBonus = faq.priority > 3 ? 0.1 : 0;

        const totalScore = keywordScore + questionSimilarity + categoryBonus;

        return {
          faq: faq,
          score: totalScore,
        };
      });

      // Sort by score descending
      const sorted = scoredFAQs.sort((a, b) => b.score - a.score);

      // Return FAQ if score is above threshold (0.4)
      if (sorted.length > 0 && sorted[0].score > 0.4) {
        return {
          matched: true,
          faq: sorted[0].faq,
          score: sorted[0].score,
          suggestions: sorted.slice(1, 3).map(item => item.faq), // Top 2 alternatives
        };
      }

      // Return top suggestions even if no direct match
      return {
        matched: false,
        suggestions: sorted.slice(0, 3).map(item => item.faq),
      };
    } catch (error) {
      console.error('Error matching query to FAQ:', error);
      return { matched: false, suggestions: [] };
    }
  }

  // Handle special greeting intents
  static isGreeting(message) {
    const greetings = [
      'hello', 'hi', 'hey', 'greetings', 'good morning',
      'good afternoon', 'good evening', 'hiya', 'howdy',
    ];
    const cleaned = message.toLowerCase().trim();
    return greetings.some(g => cleaned.startsWith(g));
  }

  // Handle order tracking query
  static isOrderTrackingQuery(message) {
    const keywords = ['track', 'order', 'where', 'status', 'shipping', 'delivery', 'track my'];
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  // Extract order ID from message (e.g., "track 12345" or "order 12345")
  static extractOrderId(message) {
    // Match patterns like "12345" or "order 12345" or "#12345"
    const patterns = [
      /(?:order|track|#)?\s*(\d{5,})/i,
      /(\d{5,})/,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // Handle refund/return query
  static isRefundReturnQuery(message) {
    const keywords = ['refund', 'return', 'money back', 'exchange', 'cancel', 'refunds'];
    const lower = message.toLowerCase();
    return keywords.some(k => lower.includes(k));
  }

  // Generate greeting response
  static getGreetingResponse() {
    const greetings = [
      "Hello! 👋 Welcome to Luxury Wear customer support. How can I help you today?",
      "Hi there! 😊 I'm here to assist you. What can I help with?",
      "Welcome! How may I assist you today?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Generate fallback response for no match
  static getFallbackResponse(suggestions = []) {
    let response = "I couldn't find a direct answer to your question. ";
    
    if (suggestions.length > 0) {
      response += "\n\nHowever, these might be helpful:\n\n";
      suggestions.forEach((faq, idx) => {
        response += `${idx + 1}. ${faq.question}\n`;
      });
      response += "\n\nWould you like to:\n• Click on one of the suggestions above\n• Create a support ticket for personalized help";
    } else {
      response += "Would you like to create a support ticket so our team can assist you personally?";
    }
    
    return response;
  }

  // Generate quick reply buttons
  static getQuickReplyButtons(query) {
    if (this.isOrderTrackingQuery(query)) {
      return [
        { label: 'Track my order', action: 'track_order' },
        { label: 'Modify order', action: 'modify_order' },
        { label: 'Cancel order', action: 'cancel_order' },
        { label: 'Contact support', action: 'create_ticket' },
      ];
    }

    if (this.isRefundReturnQuery(query)) {
      return [
        { label: 'Return policy', action: 'faq_returns' },
        { label: 'Initiate return', action: 'start_return' },
        { label: 'Refund status', action: 'refund_status' },
        { label: 'Contact support', action: 'create_ticket' },
      ];
    }

    return [
      { label: 'Browse FAQs', action: 'show_faqs' },
      { label: 'Create support ticket', action: 'create_ticket' },
      { label: 'Start over', action: 'clear_chat' },
    ];
  }

  // Generate order tracking prompt
  static getOrderTrackingPrompt() {
    return "I'd love to help you track your order! 📦\n\nPlease provide your order ID (you'll find it in your confirmation email). For example: 507f1f77bcf86cd799439011";
  }

  // Format order tracking response
  static formatOrderTrackingResponse(order) {
    let response = `📦 **Order Tracking**\n\n`;
    response += `**Order ID:** ${order._id}\n`;
    response += `**Status:** ${order.status.toUpperCase()}\n`;
    
    if (order.trackingNumber) {
      response += `**Tracking Number:** ${order.trackingNumber}\n`;
    }

    // Calculate estimated delivery
    const createdDate = new Date(order.createdAt);
    const estimatedDelivery = new Date(createdDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5-7 days estimate
    
    if (order.status !== 'delivered') {
      response += `**Estimated Delivery:** ${estimatedDelivery.toLocaleDateString()}\n`;
    } else if (order.deliveredAt) {
      response += `**Delivered Date:** ${new Date(order.deliveredAt).toLocaleDateString()}\n`;
    }

    response += `\n**Items:** `;
    if (order.orderItems && order.orderItems.length > 0) {
      response += order.orderItems.map(item => `${item.name} (qty: ${item.quantity})`).join(', ');
    }

    response += `\n**Shipping Address:**\n`;
    response += `${order.shippingAddress.fullName}\n`;
    response += `${order.shippingAddress.address}\n`;
    response += `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`;

    return response;
  }
}

module.exports = ChatBot;
