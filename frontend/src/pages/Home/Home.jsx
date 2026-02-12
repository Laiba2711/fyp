import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiHeadphones } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';
import ProductCard from '../../components/ProductCard/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategoryStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [featured, newest] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getAll({ sort: 'newest', limit: 8 })
      ]);
      setFeaturedProducts(featured.data);
      setNewArrivals(newest.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const response = await productsAPI.getCategoriesWithStats();
      setCategoryStats(response.data);
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  const categories = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400', path: '/products?category=men' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', path: '/products?category=women' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400', path: '/products?category=kids' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', path: '/products?category=accessories' },
    { name: 'Footwear', image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400', path: '/products?category=footwear' },
  ];

  // Enhanced categories with stats
  const enhancedCategories = categories.map(category => {
    const stat = categoryStats.find(s => s._id === category.name.toLowerCase());
    return {
      ...category,
      count: stat ? stat.count : 0
    };
  });

  const features = [
    { icon: <FiTruck />, title: 'Free Shipping', description: 'On orders over Rs. 5000' },
    { icon: <FiRefreshCw />, title: 'Easy Returns', description: '30 days return policy' },
    { icon: <FiShield />, title: 'Secure Payment', description: '100% secure checkout' },
    { icon: <FiHeadphones />, title: '24/7 Support', description: 'Dedicated support team' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-12 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <span className="inline-block bg-primary-500 text-white px-5 py-2 rounded-full text-sm font-medium mb-6 floating">
                New Collection 2026
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-dark-100 leading-tight mb-6 neon-glow">
                Discover Your <span className="text-primary-500">Perfect Style</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0">
                Explore our latest collection of trendy fashion items. Quality meets affordability in every piece.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/products" className="btn btn-primary neon-glow">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/products?category=women" className="btn btn-outline neon-glow">
                  Women's Collection
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800"
                alt="Fashion Model"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl neon-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className=" py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 text-white neon-card p-4 rounded-xl bg-black transition-all">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-primary-500 text-xl">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-100 mb-3 neon-glow">Shop by Category</h2>
            <p className="text-gray-600">Find what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {enhancedCategories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] neon-card"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm mb-2">{category.count} products</p>
                  <span className="text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all flex items-center gap-1">
                    Shop Now <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-100 mb-3 neon-glow">Featured Products</h2>
            <p className="text-gray-600">Our most popular items</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/products?featured=true" className="btn btn-outline neon-glow">
              View All Featured <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600 py-16 text-white text-center neon-card">
        <div className="max-w-2xl mx-auto px-4">
          <span className="inline-block bg-white/20 px-5 py-2 rounded-full text-sm font-medium mb-4 pulse">
            Limited Time Offer
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 neon-glow">Get 30% Off on Your First Order</h2>
          <p className="text-lg opacity-90 mb-8">Use code: WELCOME30 at checkout</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-500 px-8 py-3 rounded-full font-semibold hover:bg-dark-100 hover:text-white transition-all neon-glow">
            Shop Now <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-100 mb-3 neon-glow">New Arrivals</h2>
            <p className="text-gray-600">Fresh styles just for you</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/products?sort=newest" className="btn btn-outline neon-glow">
              View All New Arrivals <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-100 mb-3 neon-glow">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-8">Get the latest updates on new arrivals and exclusive offers</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full outline-none focus:border-primary-500 transition-colors"
            />
            <button type="submit" className="btn btn-primary neon-glow">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
