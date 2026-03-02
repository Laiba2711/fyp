# Support Ticket System Documentation

This document describes the full support ticket workflow in the e‑commerce project.  There are two ways tickets are created:

1. **From the chatbot** – the AI assistant suggests escalation and builds tickets.
2. **Via the standalone support page** – a public form available at `/support`.

All tickets can be viewed by users in their profile and by admins in the dashboard.

---

## Database Models

### `SupportTicket` (`backend/models/SupportTicket.js`)

Fields:
- `user`: ObjectId ref to `User` (nullable for guests)
- `guest`: nested `{ name, email }` when not logged in
- `subject`, `description`, `category` (`order_issue`, `payment_issue`, `refund`, `technical_issue`, `general`)
- `status`: `open` | `in-progress` | `resolved` | `closed`
- `orderId`: optional ObjectId ref to `Order`
- `attachments`: array of `{ filename, url }`
- `messages`: [ObjectId] ref `TicketMessage`
- `assignedTo` (admin user), `resolution`, `resolutionDate`

### `TicketMessage` (`backend/models/TicketMessage.js`)

Represents the threaded conversation for a ticket.

Fields:
- `ticket`: ObjectId to parent `SupportTicket`
- `sender`: `user` | `admin`
- `message`: text
- `attachments` (future)

---

## Middleware

- `uploadMiddleware.js` uses Multer to store ticket attachments under `uploads/tickets`.  The route accepts up to 3 files.

---

## Backend Routes

### Chat-based endpoints (`backend/routes/chatRoutes.js`)

- `POST /api/chat/ticket` – create ticket from chatbot (public). Accepts subject, description, category, guestEmail/name, orderId. **Supports multipart/form-data with optional attachments**.
- `GET /api/chat/tickets/user` – list tickets belonging to authenticated user.
- `GET /api/chat/tickets/:id` – get ticket details (user or admin)
- `GET /api/chat/tickets/admin` – admin list with optional status filter/pagination.
- `PUT /api/chat/tickets/:id/status` – admin status update.

### Standalone support page endpoints (`backend/routes/ticketRoutes.js`)

- `POST /api/tickets` – public creation form. Uses Multer for attachments and allows anonymous or logged‑in users.
- `GET /api/tickets` – admin ticket list with filtering/pagination.
- `GET /api/tickets/:id` – access controlled details (owner or admin).
- `PUT /api/tickets/:id/status` – admin status/assignment/resolution.
- `POST /api/tickets/:id/message` – add message to ticket (user or admin).

> Note: Both route sets interact with the same models so tickets created via the support page are visible in the chatbot/admin views and vice versa.

---

## Frontend Components / Pages

### Chatbot Enhancements

- `Chatbot.jsx` offers a "Create support ticket" button when fallback/low‑confidence responses occur.
- In the ticket form the user can select category, enter subject/description, optionally attach an image, and supply order ID.
- After submission, the bot confirms and the ticket is saved via `chatAPI.createTicket`.

### Public Support Page (`frontend/src/pages/Support/Support.jsx`)

- A standalone form at `/support` for users (signed in or guests) to open tickets.
- Includes the same category/subject/description/attachment fields.
- Submits to `/api/tickets` using `axios` directly.

### User Profile (`frontend/src/pages/Profile/Profile.jsx`)

- New sidebar tab "Support Tickets" with icon.
- Fetches tickets using `chatAPI.getMyTickets()` when active.
- Displays list of tickets and shows detail when selected.

### Admin Dashboard (`frontend/src/pages/Admin/Tickets.jsx`)

- Admin sub‑view with filters for status.
- List of tickets with subject/category/status.
- Detail pane shows conversation messages and allows admin to reply using `chatAPI.postTicketMessage`.
- Admin can update ticket status via dropdown using `chatAPI.updateTicketStatus`.

### API Utilities

- `frontend/src/utils/api.js` additions:
  - `postTicketMessage(ticketId, data)`
  - `getMyTickets`, `getAllTickets`, `getTicketById`, `updateTicketStatus` already existed

> The `chatAPI` object handles chat and ticket related REST calls.

---

## Admin Workflow

1. Go to `/admin` and click "Support Tickets".
2. Filter by status if desired.
3. Click a ticket to load details and conversation.
4. Reply using the input at bottom; attachments are not yet supported here.
5. Change status with dropdown; resolved tickets can include an optional resolution note.

---

## User Workflow

1. Initiate chat or navigate to `/support`.
2. Fill out ticket form; attachments are optional images.
3. Users can view their tickets via profile and check status.
4. When admin replies, the new message appears in the profile detail view (requires refresh).

---

## Daily Operations & Notes

- Attachments are stored on disk; consider cleanup policy.
- Change ticket categories or statuses in the `SupportTicket` model enums if requirements evolve.
- Frequently review resolved tickets and close old ones to prevent spam.
- Use ticket data to generate new FAQ entries and improve chatbot responses.


---

## Testing Tips

- Chatbot: send an unknown query and click "Create support ticket" to ensure escalation flows.
- Support page: submit as guest and as logged‑in user.
- Profile view: ensure tickets appear and detail toggles correctly.
- Admin: filter, reply, update status; verify changes in database.


---

This documentation can be referenced by developers and support staff when maintaining or extending the ticketing system.