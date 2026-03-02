# AI Chatbot - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Seed FAQ Data

Run this command in your backend directory:

```bash
cd backend
node seed-faqs.js
```

You should see:
```
Database connected
Cleared existing FAQs
✅ Successfully seeded 25 FAQs
```

### Step 2: Start Backend Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
```

### Step 3: Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

### Step 4: Test the Chatbot

1. Open your browser to `http://localhost:5173` (or the port Vite shows)
2. Look for the floating chat icon in the bottom-right corner
3. Click it to open the chat widget
4. Try these test messages:

**Test Query 1: Greeting**
```
hi
```

**Response**: Friendly greeting with quick options

**Test Query 2: Shipping Cost**
```
how much is shipping?
```

**Response**: FAQ answer about shipping costs with helpful/unhelpful rating

**Test Query 3: Return Policy**
```
what is your return policy?
```

**Response**: Return policy FAQ with quick action buttons

**Test Query 4: No Match (For Ticket Creation)**
```
My custom issue that's not in FAQs
```

**Response**: Suggestions with option to create support ticket

## 📁 File Structure Overview

### Backend Files Added
```
backend/
├── models/
│   ├── FAQ.js              # FAQ database schema
│   ├── ChatMessage.js      # Chat message storage
│   └── SupportTicket.js    # Support tickets for escalation
├── routes/
│   └── chatRoutes.js       # All chat API endpoints
├── utils/
│   └── chatBot.js          # AI matching algorithm
├── seed-faqs.js            # FAQ seed data script
└── server.js               # Updated with chat routes
```

### Frontend Files Added/Modified
```
frontend/src/
├── components/Chatbot/
│   ├── Chatbot.jsx         # Main component with Tailwind-based styling (replaced)
└── utils/
    └── api.js              # Updated with chat APIs
```

## 🎯 Key Features

### Chat Widget Features
✅ Floating icon (bottom-right, mobile responsive)
✅ Open/close toggle
✅ Message timestamps
✅ Typing indicator
✅ Auto-scrolling
✅ Session persistence (localStorage)
✅ Mobile-optimized interface

### New Order Tracking
- Ask the bot to track your order using casual phrases
- Inline form asks for order ID when needed
- Responses include status, estimated delivery, tracking number

### Chatbot Features
✅ Smart FAQ matching with NLP
✅ Confidence scoring
✅ Quick reply buttons
✅ FAQ suggestions
✅ Support ticket creation
✅ Helpful/unhelpful feedback
✅ Message history

## 🔧 Customization

### Add More FAQs

1. Edit `backend/seed-faqs.js`
2. Add new FAQ objects to the `faqs` array:

```javascript
{
  question: 'Your question here?',
  answer: 'Detailed answer here...',
  category: 'general',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  priority: 4,
}
```

3. Re-run: `node seed-faqs.js`

### Adjust Matching Sensitivity

Edit `backend/utils/chatBot.js`, find the match threshold:

```javascript
// In matchQueryToFAQ()
if (sorted.length > 0 && sorted[0].score > 0.4) {
  // Change 0.4 to set sensitivity
  // Higher = stricter matching
  // Lower = more permissive matching
}
```

### Change Chat Colors

Open `frontend/src/components/Chatbot/Chatbot.jsx` and look for the button classes at the top of the return block.

```jsx
<button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 ...">
```

Modify the `from-`/`to-` color utilities or replace with your own Tailwind classes to match your brand palette.

## 📊 Admin Features

### View / Manage FAQs

API endpoints available:
- `GET /api/chat/faqs` - List all FAQs
- `POST /api/chat/faqs/admin/create` - Create new FAQ (admin)
- `PUT /api/chat/faqs/:id/admin/update` - Update FAQ (admin)
- `DELETE /api/chat/faqs/:id/admin/delete` - Delete FAQ (admin)

### View Support Tickets

- Chatbot users can click the "Create support ticket" button when the bot fails to answer.  The ticket form lives inside the chat widget.
- There is also a standalone support page at `/support` where guests or logged‑in users can submit issues.
- Authenticated users may view their tickets in the **Support Tickets** tab on their profile page.

API endpoints available:
- `GET /api/chat/tickets/admin` - List all tickets (admin)
- `GET /api/chat/tickets/user` - List user's tickets (authenticated)
- `PUT /api/chat/tickets/:id/status` - Update ticket status (admin)

## 🧪 Testing the AI Matching

### Example Queries That Should Match FAQs

```
1. "Where can I track my order?"
   → Matches: "Can I track my order?"

2. "What's your return policy?"
   → Matches: "What is your return policy?"

3. "Do you have free shipping?"
   → Matches: "How much does shipping cost?"

4. "How do I reset my password?"
   → Matches: "How do I reset my password?"

5. "Can I modify my order?"
   → Matches: "Can I change my order after placing it?"
```

### Example Queries With No Match

```
1. "What's your store in London?"
   → No FAQ (or generic FAQ suggestion)
   → Offers support ticket creation

2. "Is your product vegan?"
   → No FAQ
   → Shows suggestions with ticket option

3. "Do you have a physical showroom?"
   → No FAQ
   → Recommends creating support ticket
```

## 🐛 Troubleshooting

### Chat Widget Not Appearing
```
Check:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify backend is running on port 5000
4. Check network tab for /api/chat requests
```

### FAQs Not Loading
```
Run in backend directory:
node seed-faqs.js

If it fails:
1. Verify MongoDB is running
2. Check database connection in .env
3. Delete old FAQs: db.faqs.deleteMany({})
4. Re-run seed script
```

### Messages Not Saving
```
Check:
1. Open DevTools → Application → Local Storage
2. Look for entries starting with "chat_"
3. If not present, localStorage might be disabled
4. Try incognito/private mode
```

## 📈 Performance Tips

1. **Keep FAQs Concise**: Answers should be < 500 characters ideally
2. **Use Keywords**: Add 3-5 relevant keywords to each FAQ
3. **Monitor Feedback**: Check which FAQs get unhelpful votes
4. **Regular Updates**: Update FAQs based on customer feedback
5. **Test Regularly**: Ask the bot new user questions to verify matching

## 📚 API Quick Reference

### Public APIs (No Auth Required)

```javascript
// Send message
POST /api/chat/message
{ message: "your question", sessionId: "guest_xyz" }

// Get FAQs
GET /api/chat/faqs?category=general&limit=10

// Create support ticket
POST /api/chat/ticket
{ subject, description, category, guestEmail, guestName }
```

### Authenticated APIs

```javascript
// Get chat history
GET /api/chat/history

// Get my tickets
GET /api/chat/tickets/user

// Get ticket
GET /api/chat/tickets/:id
```

### Admin APIs

```javascript
// Create FAQ
POST /api/chat/faqs/admin/create
{ question, answer, category, keywords, priority }

// Update FAQ
PUT /api/chat/faqs/:id/admin/update

// Delete FAQ
DELETE /api/chat/faqs/:id/admin/delete

// Get all tickets
GET /api/chat/tickets/admin?status=open&page=1&limit=10

// Update ticket status
PUT /api/chat/tickets/:id/status
{ status: "resolved", resolution: "..." }
```

## 🎓 Understanding the AI Algorithm

The chatbot uses three metrics to find the best FAQ:

1. **Keyword Matching** (40% weight)
   - Compares words in question to FAQ keywords
   - Ignores common words like "the", "and", "is"

2. **String Similarity** (50% weight)
   - Uses Levenshtein distance
   - Measures how similar question and FAQ are
   - Case-insensitive

3. **Priority Boost** (10% weight)
   - High-priority FAQs get boost
   - Helps important FAQs rank higher

**Total Score**: 0 to 1 (higher = better match)
- Score > 0.6: Match found, show FAQ
- Score 0.4-0.6: Uncertain, show suggestions
- Score < 0.4: No match, offer support ticket

## 💡 Pro Tips

1. **For Better Matching**: Add keywords that users might naturally ask
2. **For Better UX**: Keep answers friendly and conversational
3. **For Analytics**: Monitor views and feedback to optimize FAQs
4. **For Support**: Use admin endpoints to create tickets programmatically

## 🆘 Getting Help

1. Check the full [CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md)
2. Review [chatBot.js](./backend/utils/chatBot.js) comments
3. Check [chatRoutes.js](./backend/routes/chatRoutes.js) for endpoint details
4. Review browser console for errors
5. Check backend logs for API errors

## 🎉 You're Ready!

Your AI chatbot is now live. Start asking it questions and watch the magic happen! 🚀

---

**Last Updated**: March 3, 2026
**Chatbot Version**: 1.0
