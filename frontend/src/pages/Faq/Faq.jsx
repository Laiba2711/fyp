import { useState } from 'react';
import { FiChevronDown, FiHelpCircle, FiSearch } from 'react-icons/fi';

const Faq = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our products, select the item you want, choose your size and quantity, add to cart, and proceed to checkout. You can create an account or checkout as a guest.',
      category: 'Ordering'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards, Easypaisa, JazzCash, and Cash on Delivery (COD) for most locations.',
      category: 'Payment'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 2-5 business days within Pakistan. Express shipping is available for next-day delivery in major cities for an additional fee.',
      category: 'Shipping'
    },
    {
      question: 'Can I return or exchange my order?',
      answer: 'Yes, we offer a 30-day return policy for unused items in original condition. For exchanges, please contact our customer service team.',
      category: 'Returns'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on our website or with the courier service.',
      category: 'Ordering'
    },
    {
      question: 'What is your size guide?',
      answer: 'Our size guide is available on each product page and in the Size Guide section. We provide measurements in inches for all our clothing items to help you find the perfect fit.',
      category: 'Sizing'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within Pakistan. However, we are working on expanding our services to international locations.',
      category: 'Shipping'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support team through the Contact Us page, email at support@lgesfashion.com, or call us at +92 300 1234567 during business hours.',
      category: 'Support'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FiHelpCircle className="text-3xl text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find answers to common questions about your orders, shipping, returns, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {['All', 'Ordering', 'Payment', 'Shipping', 'Returns', 'Sizing', 'Support'].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                (category === 'All' && !searchQuery) || 
                (category !== 'All' && searchQuery.toLowerCase().includes(category.toLowerCase())) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSearchQuery(category === 'All' ? '' : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleAccordion(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <FiChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Feel free to reach out to our support team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
