import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const subtotal = cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center neon-card p-8 rounded-xl">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 neon-glow">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn btn-primary neon-glow">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 neon-glow">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              return (
                <div key={item._id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 neon-card">
                  <Link to={`/product/${product._id || product}`} className="w-full md:w-32 h-40 md:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${product._id || product}`} className="text-lg font-semibold text-gray-800 hover:text-primary-500 transition-colors">
                        {product.name || 'Product'}
                      </Link>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors neon-glow"
                          disabled={loading}
                        >
                          <FiMinus />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors neon-glow"
                          disabled={loading}
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-500">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">Rs. {item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="absolute top-4 right-4 md:relative md:top-0 md:right-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all neon-glow"
                    disabled={loading}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              );
            })}

            <div className="flex justify-between items-center pt-4">
              <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-2">
                <FiArrowLeft /> Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-gray-500 hover:text-red-500 font-medium neon-glow"
                disabled={loading}
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24 neon-card">
              <h2 className="text-xl font-bold text-gray-800 mb-6 neon-glow">Order Summary</h2>

              <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-500">Free</span> : `Rs. ${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>Rs. {tax.toFixed(0)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-800 mb-6">
                <span>Total</span>
                <span className="text-primary-500">Rs. {total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              </div>

              {shipping > 0 && (
                <p className="text-sm text-gray-500 mb-4 bg-yellow-50 p-3 rounded-lg">
                  Add Rs. {(5000 - subtotal).toLocaleString()} more to get FREE shipping!
                </p>
              )}

              {isAuthenticated ? (
                <Link to="/checkout" className="btn btn-primary w-full justify-center neon-glow">
                  Proceed to Checkout
                </Link>
              ) : (
                <Link to="/login?redirect=checkout" className="btn btn-primary w-full justify-center neon-glow">
                  Login to Checkout
                </Link>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-3">We Accept</h4>
                <div className="flex gap-3">
                  <img src="https://cdn-icons-png.flaticon.com/32/349/349221.png" alt="Visa" className="h-6" />
                  <img src="https://cdn-icons-png.flaticon.com/32/349/349228.png" alt="Mastercard" className="h-6" />
                  <span className="text-sm text-gray-500">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
