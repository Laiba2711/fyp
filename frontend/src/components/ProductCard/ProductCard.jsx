import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { productsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onDelete }) => {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || '', product.colors?.[0]?.name || '');
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(product._id);
        toast.success('Product deleted successfully');
        if (onDelete) onDelete(product._id);
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 neon-card relative">
      <Link to={`/product/${product._id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300x400'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Discount Badge */}
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full pulse">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
          <h3 className="font-semibold text-gray-800 mt-1 mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.numReviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-500">
              Rs. {product.price?.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                Rs. {product.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons - Moved outside Link to avoid nesting <a> tags */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
        <button
          onClick={handleAddToCart}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-primary-500 hover:text-white transition-colors neon-glow"
          title="Add to Cart"
        >
          <FiShoppingCart />
        </button>
        <button
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-primary-500 hover:text-white transition-colors neon-glow"
          title="Add to Wishlist"
        >
          <FiHeart />
        </button>
        <Link
          to={`/product/${product._id}`}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-primary-500 hover:text-white transition-colors neon-glow"
          title="Quick View"
        >
          <FiEye />
        </Link>
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors neon-glow"
            title="Delete Product"
          >
            <FiTrash2 />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
