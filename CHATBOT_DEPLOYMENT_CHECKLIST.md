# AI Chatbot - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Setup
- [ ] MongoDB connection verified in `.env`
- [ ] Backend server starts without errors
- [ ] Port 5000 is available
- [ ] CORS is enabled (`cors` middleware in server.js)

### Database
- [ ] FAQ seed script ran successfully: `node seed-faqs.js`
- [ ] Check FAQs in MongoDB: `db.faqs.countDocuments()`
- [ ] At least 25 FAQs should exist
- [ ] Collections created: `faqs`, `chatmessages`, `supporttickets`

### Backend Routes
- [x] Chat routes added to server.js: `/api/chat`
- [x] All endpoints defined in chatRoutes.js
- [x] Middleware (protect, admin) implemented
- [x] Error handling for all routes

### Frontend Setup
- [ ] Chatbot component updated (Chatbot.jsx with Tailwind styling)
- [ ] Chat API utilities added to api.js
- [ ] No console errors on page load

### Browser Testing
- [ ] Chat widget appears in bottom-right
- [ ] Click to open/close works
- [ ] Can send messages
- [ ] Receives bot responses
- [ ] FAQs display when matched
- [ ] Quick reply buttons work
- [ ] localStorage saves chat history
- [ ] Mobile view responsive

## 🚀 Deployment Steps

### Step 1: Prepare Environment

```bash
# Backend .env should have:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key

# Frontend .env (if needed):
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Backend Deployment

```bash
cd backend

# Install/update dependencies
npm install

# Seed FAQ database
node seed-faqs.js

# Verify server starts
npm start
# Expected: "Server running in development mode on port 5000"
```

### Step 3: Frontend Deployment

```bash
cd frontend

# Install/update dependencies
npm install

# Build for production
npm run build

# Preview build
npm run preview
```

### Step 4: Verify Integration

Test these URLs:
- [ ] Frontend: http://localhost:5173
- [ ] Backend Health: http://localhost:5000/api/health
- [ ] Chat FAQs: http://localhost:5000/api/chat/faqs

Test chat functionality:
- [ ] Click chat icon (appears after 2-3 seconds)
- [ ] Type greeting: "hi"
- [ ] Type FAQ query: "how much is shipping?"
- [ ] Create support ticket: Click button in fallback message

## 📊 Database Verification

### Check FAQs Loaded
```bash
# In MongoDB shell
use ecommerce
db.faqs.countDocuments()
# Should return: 25 (or number of FAQs seeded)

db.faqs.find({}, {question: 1}).limit(5)
# Should show FAQ questions
```

### Check Collections Exist
```bash
db.getCollectionNames()
# Should include:
# - faqs
# - chatmessages
# - supporttickets
```

## 🧪 Feature Verification Checklist

### Chat UI Features
- [ ] Floating chat icon appears
- [ ] Icon has "AI" badge
- [ ] Smooth open/close animation
- [ ] Header shows "Luxury Care"
- [ ] Close button works
- [ ] Messages display with timestamps
- [ ] Typing indicator animates
- [ ] Matches scrolls to latest message
- [ ] Input field has placeholder
- [ ] Send button disables when input empty
- [ ] Mobile view is responsive
- [ ] All text is readable

### Chatbot Features

**Greeting Test**
- [ ] User: "hi"
- [ ] Bot: Responds with greeting
- [ ] Quick options shown

**FAQ Matching Test**
- [ ] User: "how much does shipping cost?"
- [ ] Bot: Returns FAQ answer
- [ ] Shows "Was this helpful?" buttons

**No Match Test**
- [ ] User: "something not in FAQs"
- [ ] Bot: Shows suggestions (if any)
- [ ] Shows support ticket option

**Support Ticket Test**
- [ ] Click "Create support ticket"
- [ ] Form appears with fields
- [ ] Can fill and submit
- [ ] Confirmation message shows

**Quick Reply Test**
- [ ] Quick reply buttons appear
- [ ] Click button sends message
- [ ] Bot responds appropriately

### Data Persistence
- [ ] Open chat, send message
- [ ] Refresh page
- [ ] Chat history persists
- [ ] Can clear history
- [ ] LocalStorage works correctly

## 🔐 Security Checklist

- [ ] Admin routes require authentication (JWT)
- [ ] User can only see their own tickets
- [ ] No sensitive data in client-side code
- [ ] CORS enabled only for trusted origins (if production)
- [ ] Password fields not stored in logs
- [ ] Support tickets require valid data
- [ ] FAQs are read-only for non-admins

## 📈 Performance Checks

- [ ] Page loads without errors
- [ ] Chat opens within 1 second
- [ ] Messages send within 2 seconds
- [ ] No memory leaks in DevTools
- [ ] Scrolling is smooth
- [ ] Typing animation is smooth
- [ ] No excessive re-renders (React DevTools)

## 🐛 Error Handling Verification

Test error scenarios:
- [ ] Send message without backend running
- [ ] Send with empty message
- [ ] Send with XSS attempt (test sanitization)
- [ ] Rapid message sending (test rate limiting if any)
- [ ] Network error handling shows user-friendly message
- [ ] Timeout handling works

## 📝 Logging Verification

Backend console should show:
- [ ] Request logs for each message
- [ ] Database connection logs
- [ ] Error logs are clear and helpful
- [ ] No sensitive data in logs

Browser console should:
- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] API responses visible in Network tab
- [ ] LocalStorage operations succeed

## 🎯 Functional Test Cases

### Test Case 1: Basic Chat
1. Click chat icon
2. Type "hello"
3. Verify greeting response
4. Verify timestamp appears

### Test Case 2: FAQ Match
1. Type "how do i return items?"
2. Verify FAQ answer appears
3. Click "helpful" button
4. Verify success message

### Test Case 3: Ticket Creation
1. Type something not in FAQs
2. Click "Create support ticket"
3. Fill all form fields
4. Submit form
5. Verify success message with ticket ID

### Test Case 4: History Persistence
1. Send 3-4 messages
2. Refresh page
3. Verify same messages reappear
4. Verify timestamps are preserved

### Test Case 5: Mobile Responsive
1. Change browser width to mobile size (375px)
2. Verify chat expands to full screen
3. Verify buttons are still clickable
4. Verify input works
5. Test on actual mobile device

## 🔄 Post-Deployment

### Monitor These Metrics
- [ ] Chatbot response time (target: < 1 second)
- [ ] FAQ match accuracy (target: > 80%)
- [ ] Support ticket creation rate
- [ ] Customer satisfaction (helpful votes)
- [ ] Chat usage frequency

### Regular Maintenance
- [ ] Review unhelpful FAQs weekly
- [ ] Update FAQs based on new issues
- [ ] Clear resolved support tickets monthly
- [ ] Monitor database size growth
- [ ] Backup FAQ database weekly

### Improvement Tasks
- [ ] Analyze failed matches
- [ ] Add new FAQs for common issues
- [ ] Improve question phrasing
- [ ] Add more keywords
- [ ] Increase FAQ priority for popular items

## 📞 Support Resources

### If Chat Widget Doesn't Appear
```
1. Check browser console (F12)
2. Verify URL is correct
3. Check that Chatbot component is imported in App.jsx
4. Verify CSS file is linked
```

### If FAQs Don't Match
```
1. Verify seed script ran: node seed-faqs.js
2. Check MongoDB has data: db.faqs.countDocuments()
3. Check keywords are relevant
4. Lower match threshold in chatBot.js
```

### If Messages Don't Send
```
1. Verify backend is running
2. Check API URL in component
3. Check network tab for errors
4. Verify CORS is enabled
5. Check database connection
```

### If Storage Not Working
```
1. Check localStorage is enabled
2. Try incognito/private mode
3. Clear browser cache
4. Check storage quota
```

## ✨ Success Criteria

All items below should be true for successful deployment:

- [ ] Chat widget appears and is functional
- [ ] At least 25 FAQs are accessible
- [ ] FAQ matching works (test 5 questions)
- [ ] Support tickets can be created
- [ ] Chat history persists across page refresh
- [ ] Mobile view is responsive and usable
- [ ] No JavaScript errors in console
- [ ] Backend API returns 200 status codes
- [ ] Database connection is stable
- [ ] All buttons and links work
- [ ] Page load time is acceptable (< 3 seconds)
- [ ] Chat load time is fast (< 1 second)

## 🎉 Go Live Checklist

Before going live to production:

- [ ] All tests pass
- [ ] Performance optimized
- [ ] Security review completed
- [ ] Backup database created
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] FAQ content reviewed and approved
- [ ] Team trained on admin features
- [ ] Documentation shared with team
- [ ] Support contact info added to chat footer
- [ ] Terms of service reviewed
- [ ] GDPR/Privacy compliance checked

---

**Use this checklist before deployment to ensure everything works perfectly!**

**Last Updated**: March 3, 2026
