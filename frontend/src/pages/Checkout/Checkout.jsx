import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiCheck, FiShield } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'Pakistan',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const subtotal = cart.totalPrice || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 200;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      setLoading(true);
      const { data } = await ordersAPI.create({
        shippingAddress,
        paymentMethod,
      });

      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 1 ? <FiCheck /> : '1'}
            </div>
            <span className="ml-2 font-medium text-gray-700">Shipping</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > 2 ? <FiCheck /> : '2'}
            </div>
            <span className="ml-2 font-medium text-gray-700">Payment</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
            <span className="ml-2 font-medium text-gray-700">Confirm</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiTruck className="text-primary-500" /> Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="Faisalabad"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="Punjab"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="38000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        required
                        className="input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        required
                        className="input"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-6">
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiCreditCard className="text-primary-500" /> Payment Method
                  </h2>

                  <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 accent-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 accent-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Visa, Mastercard accepted</p>
                      </div>
                      <div className="flex gap-2">
                        <img src="https://cdn-icons-png.flaticon.com/24/349/349221.png" alt="Visa" className="h-6" />
                        <img src="https://cdn-icons-png.flaticon.com/24/349/349228.png" alt="Mastercard" className="h-6" />
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'easypaisa' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="easypaisa"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 accent-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">Easypaisa</p>
                        <p className="text-sm text-gray-500">Pay via Easypaisa mobile wallet</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'jazzcash' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="jazzcash"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 accent-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">JazzCash</p>
                        <p className="text-sm text-gray-500">Pay via JazzCash mobile wallet</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-outline flex-1">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || 'https://via.placeholder.com/80'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary-500">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
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
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-primary-500">Rs. {total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                <FiShield className="text-2xl text-green-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Secure Checkout</p>
                  <p className="text-gray-500">Your data is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
