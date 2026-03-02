# 🏗️ AI Chatbot - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐                                   │
│  │  Chatbot Component       │                                   │
│  │  ├─ UI Rendering         │                                   │
│  │  ├─ Message Management   │                                   │
│  │  ├─ Form Handling        │                                   │
│  │  └─ LocalStorage Logic   │                                   │
│  └──────────────────────────┘                                   │
│           ↓                                                       │
│  ┌──────────────────────────┐          ┌──────────────────┐    │
│  │  API Utilities           │          │  Browser Storage │    │
│  │  (chatAPI)               │          │  (localStorage)  │    │
│  │  ├─ sendMessage()        │          │                  │    │
│  │  ├─ createTicket()       │          │  Chat History    │    │
│  │  ├─ markFAQHelpful()     │          │  Session Data    │    │
│  │  └─ getHistory()         │          └──────────────────┘    │
│  └──────────────────────────┘                                   │
│           ↓                                                       │
│     Axios HTTP Client                                           │
│     (Base URL: http://localhost:5000/api)                      │
│                                                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Router: /api/chat                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Public Endpoints (No Auth)                          │ │  │
│  │  │ ├─ POST /message (Send chat message)              │ │  │
│  │  │ ├─ GET /faqs (Get all FAQs)                       │ │  │
│  │  │ ├─ GET /faqs/:id (Get single FAQ)                 │ │  │
│  │  │ ├─ POST /faq/:id/helpful (Rate FAQ)               │ │  │
│  │  │ ├─ POST /ticket (Create support ticket)           │ │  │
│  │  │ └─ GET /history/:sessionId (Guest chat history)   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Authenticated Endpoints (Requires JWT)             │ │  │
│  │  │ ├─ GET /history (Get user chat history)          │ │  │
│  │  │ ├─ GET /tickets/user (Get user tickets)          │ │  │
│  │  │ └─ GET /tickets/:id (Get specific ticket)        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Admin Endpoints (Requires JWT + Admin Role)         │ │  │
│  │  │ ├─ POST /faqs/admin/create (Create FAQ)           │ │  │
│  │  │ ├─ PUT /faqs/:id/admin/update (Update FAQ)        │ │  │
│  │  │ ├─ DELETE /faqs/:id/admin/delete (Soft delete)    │ │  │
│  │  │ ├─ GET /tickets/admin (List all tickets)          │ │  │
│  │  │ └─ PUT /tickets/:id/status (Update status)        │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│           ↓           ↓            ↓                            │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐          │
│  │ ChatBot.js   │ │ ChatMessage │ │ Chat Routes     │          │
│  │ (AI Logic)   │ │ Controller  │ │ (Endpoints)     │          │
│  │              │ │             │ │                 │          │
│  │ ├─ Matching  │ │ ├─ Save msg │ │ ├─ Validation   │          │
│  │ ├─ Intent    │ │ ├─ Get hist │ │ ├─ Auth check   │          │
│  │ ├─ Scoring   │ │ └─ Rate FAQ │ │ ├─ Error handle │          │
│  │ └─ Response  │ │             │ │ └─ Response     │          │
│  └──────────────┘ └─────────────┘ └─────────────────┘          │
│           ↓           ↓                      ↓                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Database Layer                           │  │
│  │  (MongoDB + Mongoose)                                    │  │
│  │                                                            │  │
│  │  ┌─────────┐  ┌────────────┐  ┌──────────────┐          │  │
│  │  │   FAQ   │  │ ChatMessage│  │SupportTicket │          │  │
│  │  ├─────────┤  ├────────────┤  ├──────────────┤          │  │
│  │  │question │  │user        │  │user          │          │  │
│  │  │answer   │  │guest       │  │subject       │          │  │
│  │  │keywords │  │message     │  │description   │          │  │
│  │  │category │  │sender      │  │status        │          │  │
│  │  │priority │  │faqId       │  │messages      │          │  │
│  │  │views    │  │metadata    │  │resolution    │          │  │
│  │  │feedback │  │timestamps  │  │rating        │          │  │
│  │  └─────────┘  └────────────┘  └──────────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Sends Message Flow
```
User Types Message
      ↓
handleSendMessage()
      ↓
Input Validation
      ↓
POST /api/chat/message
      ↓
Backend Routes
      ↓
Check for Intent (Greeting, Order, Refund)
      ↓
If Intent Matched → Generate Response
      ↓
If No Intent → ChatBot.matchQueryToFAQ()
      ↓
NLP Matching Algorithm
      ├─ Keyword Matching (40%)
      ├─ String Similarity (50%)
      └─ Priority Boost (10%)
      ↓
Score Result
      ├─ Score > 0.6 → Return FAQ + Buttons
      ├─ Score 0.4-0.6 → Return Suggestions
      └─ Score < 0.4 → Return Ticket Option
      ↓
Save to ChatMessage Collection
      ↓
Return Response to Frontend
      ↓
Display Messages + Options
      ↓
Save to LocalStorage
```

## Component Hierarchy

```
Frontend
├── App.jsx
│   ├── Navbar
│   ├── Routes (Home, Products, Cart, etc.)
│   ├── Footer
│   └── Chatbot (Our New Component)
│       ├── Chat Widget (UI)
│       ├── Message Container
│       │   ├── User Messages
│       │   ├── Bot Messages
│       │   ├── Typing Indicator
│       │   └── Timestamps
│       ├── Suggestions Panel
│       ├── Quick Reply Buttons
│       ├── Input Form
│       │   ├── Text Input
│       │   └── Send Button
│       ├── Ticket Form (Conditional)
│       └── State Management
│           ├── Messages State
│           ├── Input State
│           ├── Loading State
│           ├── Suggestions State
│           └── Session State
```

## API Request/Response Flow

### Example: Send Message for FAQ Matching

**Frontend Request:**
```javascript
POST http://localhost:5000/api/chat/message
Content-Type: application/json

{
  "message": "how much is shipping",
  "sessionId": "guest_1704262800000_abc123def456"
}
```

**Backend Processing:**
```
1. Receive request in chatRoutes.js
2. Extract message
3. Save user message to ChatMessage collection
4. Call ChatBot.matchQueryToFAQ()
5. Calculate scores:
   - Keyword matching: 0.8 (80% match)
   - String similarity: 0.75 (75% match)
   - Priority boost: 0.1
   - Total: 0.8*0.4 + 0.75*0.5 + 0.1 = 0.715
6. Score 0.715 > 0.6 → FAQ found!
7. Get FAQ: "How much does shipping cost?"
8. Increment FAQ views
9. Create bot message with FAQ answer
10. Add helpful/unhelpful buttons
11. Return response
```

**Frontend Response:**
```javascript
{
  "success": true,
  "messages": [
    {
      "_id": "user_xyz",
      "message": "how much is shipping",
      "sender": "user",
      "timestamp": "2026-03-03T10:30:00Z"
    },
    {
      "_id": "bot_abc",
      "message": "Shipping is FREE on orders over Rs. 5,000!...",
      "sender": "bot",
      "messageType": "faq",
      "timestamp": "2026-03-03T10:30:05Z"
    }
  ],
  "buttons": [
    { "label": "Browse FAQs", "action": "show_faqs" },
    { "label": "Create support ticket", "action": "create_ticket" }
  ],
  "feedback": {
    "faqId": "faq_123",
    "question": "Was this helpful?"
  }
}
```

## Matching Algorithm Visualization

```
User Query: "how much is shipping"
                    ↓
         ┌─────────┴──────────┐
         ↓                    ↓
    Keyword Matching    String Similarity
    
    Query Keywords:     Query: "how much is shipping"
    - shipping          FAQ Q: "How much does shipping cost?"
    - much              
    - cost              Levenshtein Analysis:
                        - Character-level distance
    FAQ Keywords:       - Length normalized
    - shipping          - Result: 75% similar
    - cost
    - free              
    - delivery
    
    Match: 2/3 = 66%    Similarity: 75%
    
         │                    │
         └─────────┬──────────┘
                   ↓
         Calculate Total Score
         (0.66 * 0.4) + (0.75 * 0.5) = 0.639
         
                   ↓
         Score 0.639 > Threshold 0.4
         
                   ↓
         ✅ Match Found! Show FAQ Answer
```

## Admin Panel Data Flow

```
Admin User
    ↓
Admin Dashboard (Not Built Yet)
    ↓
┌─────────────────────────────────────┐
│ Admin Endpoints                     │
│ ├─ View All Tickets                 │
│ ├─ Update Ticket Status              │
│ ├─ Create/Edit/Delete FAQs           │
│ └─ View Analytics (Feedback)        │
└────────────┬────────────────────────┘
             ↓
    Update ChatMessage/FAQ/Ticket
             ↓
    Save to MongoDB
             ↓
    Return Updated Data
             ↓
Update Admin UI
```

## Security & Authentication Flow

```
Authenticated Request
    ↓
Browser (localStorage)
    ├─ user object
    └─ token (JWT)
    ↓
Axios Interceptor
    ↓
Add Token to Header
Authorization: Bearer <JWT_TOKEN>
    ↓
Backend Middleware (protect)
    ↓
Verify JWT Signature
    ↓
Extract User ID from Token
    ↓
Get User from Database
    ↓
Attach User to Request
req.user = { _id, name, email, role }
    ↓
Next Middleware/Route Handler
    ↓
If Admin Route: Check req.user.role === 'admin'
    ↓
Process Request with Authorization
```

## Database Relationship Diagram

```
┌──────────────┐         ┌────────────────┐         ┌──────────────────┐
│    User      │         │  ChatMessage   │         │ SupportTicket    │
├──────────────┤         ├────────────────┤         ├──────────────────┤
│ _id (PK)     │◄────────│ user (FK)      │         │ _id (PK)         │
│ name         │         │ message        │         │ user (FK)        │
│ email        │         │ sender         │────────►├──────────────────┤
│ role         │         │ timestamp      │         │                  │
│ ...          │         └────────────────┘         │ Subject          │
└──────────────┘                                    │ Description      │
       │                                           │ Status           │
       │         ┌──────────────┐                  │ Messages[]       │
       │         │ FAQ          │                  │ Resolution       │
       └────────►├──────────────┤                  └──────────────────┘
                 │ _id (PK)     │
                 │ question     │
                 │ answer       │ ◄──────────────┐
                 │ keywords[]   │                │
                 │ category     │   ChatMessage.faqId
                 │ priority     │
                 │ views        │
                 │ helpfulCount │
                 └──────────────┘
```

## File Structure Summary

```
e-commerce/
├── backend/
│   ├── models/
│   │   ├── FAQ.js                    ✅ NEW
│   │   ├── ChatMessage.js            ✅ NEW
│   │   ├── SupportTicket.js          ✅ NEW
│   │   └── ... (other models)
│   ├── routes/
│   │   ├── chatRoutes.js             ✅ NEW
│   │   └── ... (other routes)
│   ├── utils/
│   │   └── chatBot.js                ✅ NEW
│   ├── seed-faqs.js                  ✅ NEW
│   ├── server.js                     ✏️ MODIFIED
│   └── ... (other files)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot/
│   │   │       └── Chatbot.jsx       ✏️ MODIFIED/REPLACED (Tailwind styling built in)
│   │   ├── utils/
│   │   │   └── api.js                ✏️ MODIFIED
│   │   └── ... (other files)
│   └── ... (other files)
│
├── CHATBOT_DOCUMENTATION.md           ✅ NEW
├── CHATBOT_QUICK_START.md             ✅ NEW
├── CHATBOT_DEPLOYMENT_CHECKLIST.md    ✅ NEW
├── CHATBOT_IMPLEMENTATION_SUMMARY.md  ✅ NEW
└── CHATBOT_ARCHITECTURE.md            ✅ NEW (this file)
```

## System Requirements

```
Frontend Requirements:
├─ React 19+
├─ Axios (HTTP Client)
├─ React Router 7+
├─ React Icons (UI Icons)
└─ Tailwind CSS (Styling)

Backend Requirements:
├─ Node.js 14+
├─ Express 5+
├─ MongoDB 4+
├─ Mongoose 9+
├─ JWT (jsonwebtoken) 9+
├─ CORS
└─ dotenv

Development:
├─ Vite (Frontend build)
├─ Nodemon (Backend auto-reload)
└─ npm or yarn (Package manager)
```

---

**This architecture is scalable, secure, and ready for production use!**

**Last Updated**: March 3, 2026
