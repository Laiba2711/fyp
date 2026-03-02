# AI Chatbot Implementation Guide

## Overview
This document provides a complete guide to the AI-powered customer support chatbot system integrated into the Luxury Wear e-commerce platform.

## Features

### 1. **Smart FAQ Matching**
- Intelligent keyword matching using Levenshtein distance algorithm
- Natural Language Processing (NLP) for query understanding
- Confidence scoring system for accurate matches
- Fallback suggestions when no exact match is found

### 2. **Chat Interface**
- Floating chat widget in bottom-right corner
- Responsive design (mobile, tablet, desktop)
- Message timestamps
- Typing indicator animation
- Smooth animations and transitions
- Session persistence using localStorage

### 3. **Response Types**
- **Text responses** - Standard AI answers
- **FAQ responses** - Matched frequently asked questions
- **Quick reply buttons** - Action suggestions
- **Support ticket forms** - Escalation to human support

### Standalone Support Page

In addition to chatbot-driven escalation, there is a public support page at `/support`. This page provides a traditional ticket form that anyone (logged in or guest) can use. Submissions on this page hit the `/api/tickets` endpoint and share the same backend models and admin UI as tickets created via chat.

### Profile Integration

Authenticated users can view their existing tickets by visiting the **Support Tickets** tab in their profile. The chat API exposes `/chat/tickets/user` for fetching the list, and the profile component displays a simple list/detail interface.

- **Helpful/Unhelpful feedback** - Rating system for FAQ answers

### 4. **Support Categories**
- General inquiries
- Shipping & delivery
- Returns & refunds
- Payment & orders
- Product information
- Account management
- Discounts & offers

## Architecture

### Backend Structure

#### Models
```
models/
├── FAQ.js              # Frequently Asked Questions
├── ChatMessage.js      # Chat message history
└── SupportTicket.js    # Support tickets from escalations
```

#### Routes
```
routes/
└── chatRoutes.js       # All chat endpoints
```

#### Utils
```
utils/
└── chatBot.js          # NLP matching logic
```

### Frontend Structure
```
frontend/src/components/Chatbot/
├── Chatbot.jsx        # Main component with Tailwind-based styling; includes order-tracking form subcomponent
```

## API Endpoints

### Public Endpoints

#### Send Message
```http
POST /api/chat/message
Content-Type: application/json
Body: {
  message: string,
  sessionId: string    (for guests)
}
Response: {
  success: boolean,
  messages: array,     (user + bot messages)
  buttons: array,      (quick reply buttons)
  suggestions: array   (FAQ suggestions)
  feedback: object     (FAQ feedback options)
}
```

#### Order Tracking
```http
POST /api/chat/track-order
Content-Type: application/json
Body: {
  message: string,      // user text, may include order ID
  sessionId?: string,   // optional guest session
  userId?: string       // set automatically by frontend when logged in
}
Response: {
  success: boolean,
  hasOrderId: boolean,
  prompt?: string,      // shown when bot needs ID
  found?: boolean,
  message?: string,
  tracking?: string,    // formatted tracking info
  action?: string,      // action key for client logic
  buttons?: array       // quick reply actions
}
```

#### Get Order (public)
```http
GET /api/chat/order/:orderId
Response: { success, order: { _id, status, trackingNumber, createdAt, deliveredAt, itemCount } }
```

#### Get Order (user)
```http
GET /api/chat/order/:orderId/user
Headers: Authorization: Bearer <token>
Response: { success, order: {...full details...} }
```

#### Get FAQs
```
GET /api/chat/faqs?category=general&limit=10
Response: [FAQ objects]
```

#### Get FAQ by ID
```
GET /api/chat/faqs/:id
Response: FAQ object with incremented views
```

#### Mark FAQ Helpful
```
POST /api/chat/faq/:faqId/helpful
Body: { helpful: boolean }
Response: Updated FAQ object
```

#### Create Support Ticket
```
POST /api/chat/ticket
Body: {
  subject: string,
  description: string,
  category: string,
  guestEmail: string,
  guestName: string,
  orderId?: string
}
Response: Created ticket object
```

#### Get Guest Chat History
```
GET /api/chat/history/:sessionId
Response: [ChatMessage objects]
```

### Authenticated Endpoints (Private)

#### Get Chat History
```
GET /api/chat/history
Response: [ChatMessage objects for logged-in user]
```

#### Get User Tickets
```
GET /api/chat/tickets/user
Response: [SupportTicket objects]
```

#### Get Ticket by ID
```
GET /api/chat/tickets/:id
Response: SupportTicket object (with authorization check)
```

### Admin Endpoints

#### Create FAQ
```
POST /api/chat/faqs/admin/create
Body: {
  question: string,
  answer: string,
  category: string,
  keywords: array,
  priority: number
}
Response: Created FAQ object
```

#### Update FAQ
```
PUT /api/chat/faqs/:id/admin/update
Body: Partial FAQ update
Response: Updated FAQ object
```

#### Delete FAQ (soft delete)
```
DELETE /api/chat/faqs/:id/admin/delete
Response: Deleted FAQ object
```

#### Get All Tickets
```
GET /api/chat/tickets/admin?status=open&page=1&limit=10
Response: {
  tickets: array,
  totalPages: number,
  currentPage: number,
  total: number
}
```

#### Update Ticket Status
```
PUT /api/chat/tickets/:id/status
Body: {
  status: 'open|in-progress|on-hold|resolved|closed',
  resolution?: string
}
Response: Updated ticket object
```

## Database Schemas

### FAQ Schema
```javascript
{
  question: String,          // Unique question
  answer: String,            // Full answer text
  category: String,          // Categorization
  keywords: [String],        // For matching
  priority: Number,          // Higher = more important
  views: Number,             // View count
  helpfulCount: Number,      // Helpful votes
  unhelpfulCount: Number,    // Unhelpful votes
  isActive: Boolean,         // Soft delete flag
  timestamps: true
}
```

### ChatMessage Schema
```javascript
{
  user: ObjectId,            // User reference (optional)
  guest: {
    email: String,
    sessionId: String
  },
  message: String,           // Message content
  sender: 'user|bot',        // Message sender
  messageType: 'text|faq|ticket|option',
  faqId: ObjectId,           // Reference to FAQ if matched
  ticketId: ObjectId,        // Reference to ticket
  metadata: {
    orderId: String,
    matchScore: Number,       // Confidence score
    suggestedFAQs: [String]
  },
  isRead: Boolean,
  timestamps: true
}
```

### SupportTicket Schema
```javascript
{
  user: ObjectId,            // User reference (optional)
  guest: {
    name: String,
    email: String
  },
  subject: String,
  description: String,
  category: String,
  priority: 'low|medium|high|urgent',
  status: 'open|in-progress|on-hold|resolved|closed',
  orderId: ObjectId,         // Related order (optional)
  attachments: [Object],     // File attachments
  messages: [{
    sender: 'user|admin',
    message: String,
    createdAt: Date
  }],
  assignedTo: ObjectId,      // Admin who handles it
  resolution: String,        // Resolution notes
  resolutionDate: Date,      // When resolved
  rating: Number,            // 1-5 rating
  feedback: String,          // Resolution feedback
  timestamps: true
}
```

## AI Matching Logic

### Algorithm Overview

The ChatBot utility uses a **hybrid matching system** combining:

1. **Keyword Matching (40% weight)**
   - Extracts keywords from user query
   - Removes common stop words
   - Matches against FAQ keywords
   - Score = matching keywords / total keywords

2. **String Similarity (50% weight)**
   - Uses Levenshtein distance algorithm
   - Calculates similarity between query and FAQ question
   - Case-insensitive comparison
   - Score = 1 - (distance / maxLength)

3. **Category Relevance (10% weight)**
   - Boosts high-priority FAQs
   - Adds 0.1 to score if priority > 3

### Match Threshold
- **Strong match**: Score > 0.6 → Returns FAQ with confidence
- **Weak match**: Score 0.4-0.6 → Returns suggestions
- **No match**: Score < 0.4 → Offers support ticket

### Intent Detection

#### Greeting Detection
Recognizes: "hello", "hi", "hey", "greetings", etc.
Response: Customized greeting with quick options

#### Order Tracking Detection
Keywords: "track", "order", "where", "status", "shipping", "delivery"
Quick Replies:
- Track my order
- Modify order
- Cancel order
- Contact support

#### Refund/Return Detection
Keywords: "refund", "return", "money back", "exchange", "cancel"
Quick Replies:
- Return policy
- Initiate return
- Refund status
- Contact support

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Seed FAQ Database**
```bash
node seed-faqs.js
```

3. **Verify Routes in server.js**
```javascript
app.use('/api/chat', require('./routes/chatRoutes'));
```

4. **Start Server**
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup

1. **Chatbot Component Already Integrated**
   - Located at: `frontend/src/components/Chatbot/Chatbot.jsx`
   - Styling: implemented with Tailwind classes inside `Chatbot.jsx` (no separate CSS file)

2. **Component is Used in App.jsx**
   - Already imported and rendered

3. **Start Frontend**
```bash
cd frontend
npm run dev
```

## Usage

### For Customers

1. **Open Chat Widget**
   - Click the floating chat icon (bottom-right)
   - AI badge shows it's AI-powered

2. **Ask Questions**
   - Type your question
   - Bot responds with FAQ answer or suggestions
   - Click quick replies or suggestions
   - Rate answers as helpful/unhelpful

3. **Create Support Ticket**
   - Click "Create support ticket" button
   - Fill in the form
   - Ticket created and sent to admin

4. **Chat History**
   - Automatically saved in browser localStorage
   - Persists across sessions
   - Different sessions have different IDs

### For Admins

1. **Manage FAQs**
   - Create new FAQs with keywords and priority
   - Update existing FAQs
   - Archive (soft delete) FAQs
   - Monitor FAQ views and feedback

2. **View Support Tickets**
   - View all tickets with filters (status, priority)
   - Assign tickets to team members
   - Add messages and track conversation
   - Update status and resolution
   - Close completed tickets

3. **Analytics**
   - Monitor FAQ performance (views, helpful votes)
   - Track average resolution time
   - Identify common issues from tickets
   - Optimize FAQs based on usage

## Configuration

### API Base URL
```javascript
// frontend/src/components/Chatbot/Chatbot.jsx
const API_BASE = 'http://localhost:5000/api/chat';
```

### Session Duration
- Sessions persist indefinitely in localStorage
- Clear cache to reset session
- Each browser gets unique sessionId

### Match Threshold
- Edit in `backend/utils/chatBot.js`
- Default: 0.4 (40% confidence for suggestions)
- Increase for stricter matching
- Decrease for more permissive matching

## Customization

### Add Custom Greetings
```javascript
// backend/utils/chatBot.js
static getGreetingResponse() {
  const greetings = [
    "Your custom greeting here",
    // Add more greetings
  ];
}
```

### Add Intent Categories
```javascript
// backend/utils/chatBot.js
static isCustomIntent(message) {
  const keywords = ['keyword1', 'keyword2'];
  return keywords.some(k => message.toLowerCase().includes(k));
}

// In handleSendMessage of routes/chatRoutes.js
if (ChatBot.isCustomIntent(message)) {
  // Handle custom intent
}
```

### Customize Response Buttons
```javascript
// backend/utils/chatBot.js
static getQuickReplyButtons(query) {
  if (this.isYourIntent(query)) {
    return [
      { label: 'Custom Button 1', action: 'action_1' },
      { label: 'Custom Button 2', action: 'action_2' },
    ];
  }
}
```

## Testing

### Test Queries

**Greeting**
- "Hi"
- "Hello"

**Order Tracking**
- "Where is my order?"
- "Track my package"
- "What's my delivery status?"

**Returns**
- "How do I return items?"
- "Can I get a refund?"
- "Return policy"

**Shipping**
- "How much is shipping?"
- "Free shipping?"
- "Delivery time?"

**Support Ticket**
- Ask something not in FAQs
- Click "Create support ticket"
- Fill form and submit

## Performance Tips

1. **Keyword Optimization**
   - Use varied keywords for better matching
   - Include synonyms
   - Use common misspellings

2. **FAQ Organization**
   - Keep answers concise (< 500 chars)
   - Use clear language
   - Include step-by-step instructions

3. **Priority System**
   - Set higher priority for popular FAQs
   - Monitor FAQ views for optimization
   - Adjust based on user feedback

4. **Caching**
   - FAQs are fetched at chat open
   - Browser caches responses
   - Clear cache if FAQs not updating

## Troubleshooting

### Chatbot Not Responding
1. Check backend server is running
2. Verify API base URL matches server
3. Check browser console for errors
4. Verify FAQs are seeded in database

### Messages Not Saving
1. Check localStorage is enabled
2. Verify browser allows localStorage
3. Check browser storage quota
4. Clear cache and try again

### FAQs Not Matching
1. Verify keywords are added to FAQs
2. Check question text is clear
3. Lower match threshold if too strict
4. Review matching algorithm logs

### Database Connection Issues
1. Verify MongoDB is running
2. Check connection string in .env
3. Verify database exists
4. Check user permissions

## Future Enhancements

1. **Machine Learning**
   - Train ML model on chat history
   - Improve matching accuracy over time
   - Predict customer intent

2. **Multilingual Support**
   - Support multiple languages
   - Auto-detect user language
   - Translate FAQs

3. **Advanced Analytics**
   - Chat sentiment analysis
   - Customer satisfaction scoring
   - Predictive support needs

4. **Integration**
   - Email notifications for tickets
   - SMS alerts
   - Slack notifications for admins
   - CRM integration

5. **AI Enhancements**
   - Context awareness between messages
   - Follow-up question suggestions
   - Smart ticket categorization

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Check browser console
4. Contact development team

---

**Last Updated**: March 3, 2026
**Version**: 1.0
