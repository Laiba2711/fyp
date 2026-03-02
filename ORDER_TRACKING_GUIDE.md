# Order Tracking Integration Guide

This document describes the new order-tracking feature added to the chatbot. It includes API details, intent handling, conversation flows, and UI behavior.

---

## 🌟 Overview

Users can now ask the chatbot to locate their order. The system supports both guests and authenticated users. The chatbot will:

1. Detect an order-tracking intent using keywords.
2. Ask for an order ID if it wasn't provided.
3. Validate ownership when the user is logged in (JWT token required).
4. Fetch status, estimated delivery, tracking number, and partial order details.
5. Handle invalid/unknown IDs gracefully and offer follow-up actions.

Security is enforced through `protect` middleware for user-specific data.

---

## 📦 API Endpoints

All endpoints are under `/api/chat`.

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/order/:orderId` | Public | Lookup order by ID (minimal info). Useful for guest tracking. |
| GET | `/order/:orderId/user` | Private (JWT) | Full order details, only if the current user owns the order. |
| POST | `/track-order` | Public | Primary interface for chatbot messages. Handles extraction of ID, permission checks, and returns formatted response text. |

### `/track-order` request/response schema

**Request body**:
```json
{
  "message": "Where is my order 605c9f1b8e62052bb4d6a0c2",
  "sessionId": "guest_xxx",    // optional for guests
  "userId": "607d1f77bcf86cd799439011" // optional if logged in
}
```

**Successful response when ID provided and found**:
```json
{
  "success": true,
  "hasOrderId": true,
  "found": true,
  "tracking": "<formatted markdown text>",
  "action": "order_found",
  "buttons": [ ... ]
}
```

**Response when ID missing**:
```json
{ "success": true, "hasOrderId": false, "prompt": "I'd love to help you track your order!..." }
```

**Response when order not found or permission denied** contains `found:false` and appropriate message.

---

## 🤖 Bot Logic Changes

Updated `backend/utils/chatBot.js`:
- `isOrderTrackingQuery()` expanded keywords.
- Added `extractOrderId()` to parse numbers from text.
- `getOrderTrackingPrompt()` returns a friendly ask-ID message.
- `formatOrderTrackingResponse()` builds markdown-style order summary.

The `/message` route still processes ordinary FAQs; `/track-order` handles tracking-specific flow.

---

## 🧩 Frontend Changes

**Chatbot UI updates** (`Chatbot.jsx`):

- `handleSendMessage()` checks for tracking intent locally and calls `/track-order` when appropriate.
- If the bot asks for an ID, an `OrderInputForm` component is displayed inline.
- Messages with type `order_tracking` are styled specially (blue background, border).
- Quick‑reply buttons offer "View full details", "Report issue", etc.

**API updates** (`api.js`):
- Added `trackOrder`, `getOrderPublic`, and `getOrderPrivate` helper methods in `chatAPI`.


---

## 🗣️ Example Conversation Flow

1. **User**: _"Where is my order?"_

   **Bot**: "I'd love to help you track your order! Please provide your order ID..."

2. **User**: _"12345"_

   **Bot**: "📦 **Order Tracking**\n\n**Order ID:** 12345\n**Status:** PROCESSING\n**Estimated Delivery:** 3/15/2026\n**Items:** Red Shirt (qty:1)\n**Shipping Address:** Jane Doe..."

   _Buttons: [View full details] [Report issue] [Track another]_

3. (If logged in and ID doesn't belong) **Bot**: "You do not have permission to view this order..."

4. (If ID invalid) **Bot**: "Order 99999 not found. Please double-check..."

5. (Guest asking again) _Bot prompts with the same ID request or suggests creating a ticket._

---

## ⚠️ Error Handling & Edge Cases

- Non‑numeric IDs or short strings are rejected early with a friendly message.
- Logged‑in users attempting to view others' orders receive a permission denied response.
- API errors return `success: false` and are handled by the chatbot with a generic apology.

---

## ✅ Testing

1. Seed orders manually in MongoDB or create via front‑end checkout.
2. Hit `/api/chat/track-order` with various combinations of messages to simulate conversation.
3. Ensure `userId` is passed (JWT token) for private requests.
4. Confirm UI displays order form correctly and styles order responses.

---

## 📦 Deployment Notes

- No database migrations required; the `Order` model already contained necessary fields (`status`, `trackingNumber`, etc.).
- Ensure JWT auth is active for `/order/:orderId/user`.
- Update documentation files to include the tokens and routes (see next section).

---

End of guide.
