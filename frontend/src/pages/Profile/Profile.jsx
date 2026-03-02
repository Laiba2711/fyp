import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiShoppingBag, FiHeart, FiLogOut, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authAPI, ordersAPI, chatAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'Pakistan',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await ordersAPI.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getMyTickets();
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = async (id) => {
    try {
      setLoading(true);
      const res = await chatAPI.getTicketById(id);
      setSelectedTicket(res.data);
    } catch (error) {
      console.error('Error opening ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      await chatAPI.postTicketMessage(selectedTicket.ticket._id, { message: replyText });
      setReplyText('');
      openTicket(selectedTicket.ticket._id);
      fetchTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authAPI.updateProfile(formData);
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-primary-500">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiUser /> My Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiShoppingBag /> My Orders
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'wishlist' ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiHeart /> Wishlist
                </button>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'tickets' ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FiFileText /> Support Tickets
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-primary-500 hover:text-primary-600"
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiUser className="text-xl text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-800">{user.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiMail className="text-xl text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiPhone className="text-xl text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-800">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <FiMapPin className="text-xl text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-800">
                            {user.address?.city ? `${user.address.city}, ${user.address.country}` : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">My Orders</h2>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/order/${order._id}`}
                        className="block p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <p className="font-medium text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className="font-bold text-primary-500">Rs. {order.totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {order.orderItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.orderItems.length > 3 && (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiShoppingBag className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link to="/products" className="btn btn-primary mt-4">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">My Support Tickets</h2>
                {loading ? (
                  <p>Loading tickets…</p>
                ) : (
                  <div className="md:flex gap-6">
                    <ul className="md:w-1/3 space-y-2">
                      {tickets.map(t => (
                        <li
                          key={t._id}
                          className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => openTicket(t._id)}
                        >
                          <div className="font-semibold">{t.subject}</div>
                          <div className="text-sm text-gray-500 capitalize">{t.category.replace('_',' ')}</div>
                          <div className="text-xs text-gray-400">{t.status}</div>
                        </li>
                      ))}
                    </ul>
                    <div className="md:flex-1">
                      {selectedTicket ? (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{selectedTicket.ticket.subject}</h3>
                          <p className="mb-4">{selectedTicket.ticket.description}</p>
                          {selectedTicket.ticket.attachments && selectedTicket.ticket.attachments.length > 0 && (
                            <div className="mb-4">
                              <p className="font-medium">Attachments:</p>
                              <ul className="list-disc list-inside">
                                {selectedTicket.ticket.attachments.map((att, idx) => (
                                  <li key={idx}>
                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                      {att.filename}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="text-sm text-gray-500">Status: {selectedTicket.ticket.status}</p>

                          {/* conversation messages */}
                          <div className="mt-4 space-y-2 max-h-64 overflow-auto">
                            {selectedTicket.messages.map(m => (
                              <div key={m._id} className={`p-2 rounded ${m.sender==='admin' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                                <div className="text-sm">{m.message}</div>
                                <div className="text-[10px] text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              className="flex-1 border rounded px-2 py-1"
                              placeholder="Type a reply..."
                            />
                            <button onClick={sendReply} className="bg-indigo-500 text-white px-3 py-1 rounded">Send</button>
                          </div>
                        </div>
                      ) : (
                        <p>Select a ticket to view details</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">My Wishlist</h2>
                <div className="text-center py-12">
                  <FiHeart className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link to="/products" className="btn btn-primary mt-4">
                    Browse Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
