import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiX, FiSend, FiShoppingBag } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi! I'm your shopping assistant. I can help you find products, get recommendations, and answer questions. What are you looking for today?",
      suggestions: ['Show me trending items', "Men's collection", "Women's collection", 'Best deals'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await processQuery(text.toLowerCase());
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: "Sorry, I couldn't process that. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const processQuery = async (query) => {
    // Product search keywords
    const categories = {
      men: ['men', 'male', 'guys', 'man', "men's"],
      women: ['women', 'female', 'ladies', 'woman', "women's", 'girls'],
      kids: ['kids', 'children', 'child', 'baby', 'toddler'],
      accessories: ['accessories', 'accessory', 'watch', 'belt', 'bag', 'sunglasses'],
      footwear: ['footwear', 'shoes', 'sneakers', 'heels', 'boots', 'sandals'],
    };

    const priceKeywords = ['cheap', 'affordable', 'budget', 'expensive', 'premium', 'luxury'];
    const trendKeywords = ['trending', 'popular', 'best', 'top', 'new', 'latest', 'featured'];
    const dealKeywords = ['deal', 'discount', 'sale', 'offer', 'promotion'];

    // Check for category queries
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((k) => query.includes(k))) {
        try {
          const { data } = await productsAPI.getByCategory(category);
          if (data.length > 0) {
            setRecommendations(data.slice(0, 4));
            return {
              type: 'bot',
              text: `Here are some ${category}'s products you might like:`,
              products: data.slice(0, 4),
              suggestions: ['Show more options', 'Different category', 'Filter by price'],
            };
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Check for trending/featured products
    if (trendKeywords.some((k) => query.includes(k))) {
      try {
        const { data } = await productsAPI.getFeatured();
        if (data.length > 0) {
          setRecommendations(data.slice(0, 4));
          return {
            type: 'bot',
            text: 'Here are our trending and featured products:',
            products: data.slice(0, 4),
            suggestions: ['Show more', 'Browse by category', 'Check deals'],
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Check for deals
    if (dealKeywords.some((k) => query.includes(k))) {
      try {
        const { data } = await productsAPI.getAll({ sort: 'price-asc', limit: 4 });
        if (data.products?.length > 0) {
          setRecommendations(data.products);
          return {
            type: 'bot',
            text: 'Check out these amazing deals:',
            products: data.products,
            suggestions: ['More deals', 'Premium items', 'New arrivals'],
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Search by product name
    if (query.length > 3) {
      try {
        const { data } = await productsAPI.getAll({ search: query, limit: 4 });
        if (data.products?.length > 0) {
          setRecommendations(data.products);
          return {
            type: 'bot',
            text: `Found these products matching "${query}":`,
            products: data.products,
            suggestions: ['Refine search', 'Browse all', 'Help me choose'],
          };
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Greeting responses
    if (['hi', 'hello', 'hey', 'hii'].some((g) => query.includes(g))) {
      return {
        type: 'bot',
        text: 'Hello! Welcome to LGES Fashion. How can I help you today?',
        suggestions: ['Show products', 'Help me find', 'Track order'],
      };
    }

    // Help responses
    if (['help', 'assist', 'support'].some((h) => query.includes(h))) {
      return {
        type: 'bot',
        text: 'I can help you with:\n• Finding products\n• Getting recommendations\n• Checking categories\n• Finding deals\n\nJust tell me what you\'re looking for!',
        suggestions: ["Men's wear", "Women's wear", 'Best sellers'],
      };
    }

    // Default response
    return {
      type: 'bot',
      text: "I'm not sure about that. Try asking about:\n• Product categories (Men, Women, Kids)\n• Trending items\n• Best deals\n• Or search for specific products",
      suggestions: ['Browse products', 'Show trending', 'Help'],
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-primary-500 hover:bg-primary-600'
        }`}
      >
        {isOpen ? (
          <FiX className="text-2xl text-white" />
        ) : (
          <FiMessageCircle className="text-2xl text-white" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FiShoppingBag className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Shopping Assistant</h3>
              <p className="text-xs text-white/80">AI-Powered Recommendations</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>

              {/* Product Recommendations */}
              {message.products && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {message.products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      onClick={() => setIsOpen(false)}
                      className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={product.name}
                        className="w-full h-20 object-cover rounded-md mb-2"
                      />
                      <p className="text-xs font-medium text-gray-800 line-clamp-1">{product.name}</p>
                      <p className="text-xs font-bold text-primary-500">Rs. {product.price?.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
