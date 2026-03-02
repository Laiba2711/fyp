const mongoose = require('mongoose');
const dotenv = require('dotenv');
const FAQ = require('./models/FAQ');
const connectDB = require('./config/db');

dotenv.config();

// Comprehensive FAQ data
const faqs = [
  // General
  {
    question: 'What is Luxury Wear?',
    answer: 'Luxury Wear is a premium e-commerce platform offering high-quality fashion clothing and accessories for men, women, kids, and footwear. We focus on providing stylish, contemporary designs with excellent customer service.',
    category: 'general',
    keywords: ['luxury', 'wear', 'about', 'company', 'brand'],
    priority: 5,
  },
  {
    question: 'How do I create an account?',
    answer: 'To create an account, click on "Register" on our homepage. Enter your name, email address, and a secure password. Click "Sign Up" and you\'re all set! You can now shop and save your preferences.',
    category: 'account',
    keywords: ['register', 'signup', 'account', 'create', 'new user'],
    priority: 4,
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Click the link and create a new password. You\'ll be able to log in with your new password.',
    category: 'account',
    keywords: ['forgot', 'password', 'reset', 'login'],
    priority: 4,
  },
  
  // Shipping
  {
    question: 'How much does shipping cost?',
    answer: 'Shipping is FREE on orders over Rs. 5,000! For orders under Rs. 5,000, shipping costs Rs. 200. We offer standard delivery within 5-7 business days across Pakistan.',
    category: 'shipping',
    keywords: ['shipping', 'cost', 'delivery', 'free', 'fee'],
    priority: 5,
  },
  {
    question: 'Where do you deliver?',
    answer: 'We deliver all across Pakistan to all major cities. Standard delivery takes 5-7 business days. You can track your order in real-time using the tracking link provided via email and SMS.',
    category: 'shipping',
    keywords: ['delivery', 'location', 'areas', 'cities', 'where'],
    priority: 4,
  },
  {
    question: 'What are the delivery times?',
    answer: 'Standard delivery takes 5-7 business days from the date your order is confirmed and shipped. Delivery times may vary during peak seasons. You can check estimated delivery date on your order page.',
    category: 'shipping',
    keywords: ['delivery', 'time', 'when', 'days', 'fast'],
    priority: 4,
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes! Once your order ships, you\'ll receive an email and SMS with a tracking link. You can also log into your account and check your order status in real-time. Visit our tracking page with your order ID.',
    category: 'shipping',
    keywords: ['track', 'tracking', 'order', 'status', 'locate'],
    priority: 4,
  },

  // Returns & Refunds
  {
    question: 'What is your return policy?',
    answer: 'We offer 30 days return policy from the date your order is delivered. Items must be unused, unwashed, and in original condition with all tags attached. Return shipping is free for defective items.',
    category: 'returns',
    keywords: ['return', 'policy', 'returns', 'back'],
    priority: 5,
  },
  {
    question: 'How do I initiate a return?',
    answer: 'To return an item: 1) Log into your account 2) Go to "My Orders" 3) Click "Return" on the item 4) Select a return reason 5) Print the return label 6) Drop off at any courier. Your refund will be processed within 5-7 days of receiving the return.',
    category: 'returns',
    keywords: ['return', 'how', 'initiate', 'start', 'process'],
    priority: 4,
  },
  {
    question: 'How long does a refund take?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect your returned item. The amount will be credited back to your original payment method. You\'ll receive an email confirmation once processed.',
    category: 'returns',
    keywords: ['refund', 'time', 'when', 'how long', 'money back'],
    priority: 4,
  },
  {
    question: 'What items cannot be returned?',
    answer: 'Items that cannot be returned include: customized/personalized items, underwear and intimate apparel, items that show signs of wear or damage, and items without original tags or packaging. Sale items can be returned as per our return policy.',
    category: 'returns',
    keywords: ['cannot', 'non-returnable', 'exclusion', 'final sale', 'not allowed'],
    priority: 3,
  },

  // Payment & Orders
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods: COD (Cash on Delivery), Credit/Debit Cards, JazzCash, and EasyPaisa. Choose your preferred payment method at checkout. All transactions are secure and encrypted.',
    category: 'payment',
    keywords: ['payment', 'methods', 'pay', 'accept', 'credit card'],
    priority: 5,
  },
  {
    question: 'Is it safe to pay online?',
    answer: 'Yes, absolutely! All online transactions are secured with SSL encryption. Your card details are never stored on our servers. We use trusted payment gateways that comply with PCI DSS standards. Your payment information is completely safe.',
    category: 'payment',
    keywords: ['safe', 'secure', 'payment', 'encryption', 'fraud'],
    priority: 4,
  },
  {
    question: 'Can I change my order after placing it?',
    answer: 'You can modify your order within 1 hour of placing it. After 1 hour, the order enters processing and cannot be modified. In this case, you\'ll need to return the item after delivery. Contact our support team immediately for urgent changes.',
    category: 'orders',
    keywords: ['change', 'modify', 'order', 'edit', 'cancel'],
    priority: 3,
  },
  {
    question: 'How do I cancel my order?',
    answer: 'If your order hasn\'t been shipped yet, you can cancel it from your account page. Go to "My Orders" and click "Cancel Order". If already shipped, you\'ll need to refuse it at delivery or initiate a return after receiving it.',
    category: 'orders',
    keywords: ['cancel', 'order', 'stop', 'abort'],
    priority: 3,
  },

  // Products & Sizing
  {
    question: 'What sizes do you offer?',
    answer: 'We offer sizes from XS to XXL for most items, and Free Size for accessories. Check our Size Guide for accurate measurements for men, women, and kids. We also provide virtual try-on for selected items.',
    category: 'products',
    keywords: ['size', 'sizing', 'fit', 'small', 'large'],
    priority: 4,
  },
  {
    question: 'How do I know if an item will fit me?',
    answer: 'Check our detailed Size Guide on each product page. It includes measurements in cm and inches. You can also check customer reviews for fit feedback. If uncertain, we allow free returns within 30 days if items don\'t fit.',
    category: 'products',
    keywords: ['fit', 'size', 'fitting', 'measurement', 'guide'],
    priority: 4,
  },
  {
    question: 'Do you have plus sizes?',
    answer: 'Yes, we offer a range of sizes including plus sizes. Check the product page for available sizes. Our Size Guide helps you find the perfect fit. If you can\'t find your size, contact our support team as we may be able to assist.',
    category: 'products',
    keywords: ['plus', 'size', 'large', 'xl', 'xxl'],
    priority: 3,
  },
  {
    question: 'Can I see the product in different colors?',
    answer: 'Yes! Each product page shows all available colors. Click on the color swatches to see different views of the item. Product photos are taken in natural light to accurately represent colors. Note that colors may appear slightly different on different screens.',
    category: 'products',
    keywords: ['color', 'colours', 'shades', 'variants'],
    priority: 3,
  },
  {
    question: 'Are your products authentic?',
    answer: 'Yes, all our products are 100% authentic and sourced directly from brands and authorized distributors. We guarantee authenticity on all items. If you receive a counterfeit item, we offer immediate refund and replacement.',
    category: 'products',
    keywords: ['authentic', 'real', 'genuine', 'fake', 'counterfeit'],
    priority: 4,
  },
  {
    question: 'What is your quality guarantee?',
    answer: 'We guarantee the quality of all products. If you receive a defective item, we\'ll replace it or issue a full refund immediately - no questions asked. Contact our support team with photos of the defect.',
    category: 'products',
    keywords: ['quality', 'defect', 'guarantee', 'warranty', 'broken'],
    priority: 4,
  },

  // Discounts & Offers
  {
    question: 'How do I use a promo code?',
    answer: 'During checkout, look for the "Promo Code" or "Discount Code" field. Enter your code and click "Apply". The discount will be deducted from your total. Each code can be used once unless specified otherwise.',
    category: 'payment',
    keywords: ['promo', 'discount', 'code', 'coupon', 'offer'],
    priority: 3,
  },
  {
    question: 'Do you offer student or corporate discounts?',
    answer: 'Yes! We offer special discounts for students and corporate bulk orders. Students can apply with valid student ID for 10% off. For corporate inquiries, contact our B2B team at support@luxurywear.com.',
    category: 'payment',
    keywords: ['discount', 'student', 'corporate', 'bulk', 'special'],
    priority: 3,
  },
  {
    question: 'When are your sales and promotions?',
    answer: 'We run seasonal sales in summer and winter. Major sales include Black Friday, Eid, and New Year specials. Subscribe to our newsletter to get notified about upcoming sales and exclusive offers first.',
    category: 'payment',
    keywords: ['sale', 'promotion', 'discount', 'offers', 'deals'],
    priority: 3,
  },

  // Customer Service
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us through multiple channels: Email: support@luxurywear.com, Phone: 0800-LUXURY1, Chat: Use the chat widget on our website, Facebook/Instagram: @LuxuryWearPK. Our team responds within 24 hours.',
    category: 'general',
    keywords: ['contact', 'support', 'help', 'customer service', 'reach us'],
    priority: 5,
  },
  {
    question: 'What are your business hours?',
    answer: 'Our customer support team is available Monday to Friday, 9 AM to 6 PM PST. Saturday and Sunday we respond to emails and chat messages with delayed response times. For urgent issues, use our emergency hotline.',
    category: 'general',
    keywords: ['business', 'hours', 'working', 'open', 'closed'],
    priority: 3,
  },
];

async function seedFAQs() {
  try {
    await connectDB();
    console.log('Database connected');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Insert new FAQs
    const result = await FAQ.insertMany(faqs);
    console.log(`✅ Successfully seeded ${result.length} FAQs`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
