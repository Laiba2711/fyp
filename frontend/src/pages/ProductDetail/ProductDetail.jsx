import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiMinus, FiPlus, FiCheck, FiTruck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, recsRes] = await Promise.all([
        productsAPI.getById(id),
        productsAPI.getRecommendations(id).catch(() => ({ data: [] }))
      ]);
      setProduct(productRes.data);
      setRecommendations(recsRes.data || []);

      if (productRes.data.sizes?.length > 0) {
        setSelectedSize(productRes.data.sizes[0]);
      }
      if (productRes.data.colors?.length > 0) {
        setSelectedColor(productRes.data.colors[0].name);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < product.stock) {
      setQuantity(quantity + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap neon-glow">
          <Link to="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-500">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-500 capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-4 neon-card">
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x800'}
                alt={product.name}
                className="w-full aspect-[3/4] object-cover"
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-primary-500 text-white px-4 py-2 rounded-full font-semibold pulse">
                  -{product.discount}%
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors neon-glow ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <span className="text-sm text-gray-500 uppercase tracking-wider neon-glow">
              {product.category} / {product.subcategory}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mt-2 mb-4 neon-glow">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-600">{product.rating?.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-3xl font-bold text-primary-500">Rs. {product.price?.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">Rs. {product.originalPrice?.toLocaleString()}</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Save Rs. {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {product.stock > 0 ? (
                <><FiCheck /> In Stock ({product.stock} available)</>
              ) : (
                'Out of Stock'
              )}
            </div>

            {/* Size Selection */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-800 mb-3">Size:</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] h-12 px-4 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-200 hover:border-primary-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block font-semibold text-gray-800 mb-3">
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                      }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <label className="block font-semibold text-gray-800 mb-3">Quantity:</label>
              <div className="inline-flex items-center border-2 border-gray-200 rounded-lg">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 neon-glow"
                >
                  <FiMinus />
                </button>
                <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange('increase')}
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 neon-glow"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 min-w-[200px] btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors neon-glow">
                <FiHeart />
              </button>
              <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-colors neon-glow">
                <FiShare2 />
              </button>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4 neon-card">
              {[
                { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders over Rs. 5000' },
                { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30 days return policy' },
                { icon: <FiShield />, title: 'Secure Payment', desc: '100% secure checkout' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-2xl text-primary-500">{feature.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{feature.title}</p>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-16 neon-card">
          <div className="flex border-b border-gray-100">
            {['description', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center font-semibold transition-colors relative neon-glow ${
                  activeTab === tab ? 'text-primary-500' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'description' ? 'Description' : `Reviews (${product.numReviews})`}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
                {product.brand && <p className="text-gray-700"><strong>Brand:</strong> {product.brand}</p>}
                {product.tags?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-4">
                    <strong className="text-gray-700">Tags:</strong>
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-gray-800">{review.name}</strong>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.comment}</p>
                        <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 neon-glow">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
