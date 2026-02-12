import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, ordersAPI, authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'men',
    brand: '',
    stock: '',
    images: '',
    sizes: [],
    featured: false,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, ordersRes, usersRes] = await Promise.all([
        ordersAPI.getStats().catch(() => ({ data: {} })),
        productsAPI.getAll({ limit: 100 }),
        ordersAPI.getAll({ limit: 50 }),
        authAPI.getAllUsers().catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice) || Number(productForm.price),
        stock: Number(productForm.stock),
        images: productForm.images.split(',').map(url => url.trim()).filter(Boolean),
        discount: productForm.originalPrice ? Math.round((1 - productForm.price / productForm.originalPrice) * 100) : 0,
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }

      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      brand: product.brand || '',
      stock: product.stock,
      images: product.images?.join(', ') || '',
      sizes: product.sizes || [],
      featured: product.featured || false,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        toast.success('Product deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'men',
      brand: '',
      stock: '',
      images: '',
      sizes: [],
      featured: false,
    });
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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-dark-100 min-h-screen p-6 hidden md:block">
          <h2 className="text-2xl font-bold text-white mb-8">Admin Panel</h2>
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: FiDollarSign },
              { id: 'products', label: 'Products', icon: FiPackage },
              { id: 'orders', label: 'Orders', icon: FiShoppingBag },
              { id: 'users', label: 'Users', icon: FiUsers },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <item.icon /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Mobile Tab Selector */}
          <div className="md:hidden mb-6">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg"
            >
              <option value="overview">Overview</option>
              <option value="products">Products</option>
              <option value="orders">Orders</option>
              <option value="users">Users</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Revenue</p>
                          <p className="text-2xl font-bold text-gray-800">Rs. {(stats.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FiDollarSign className="text-xl text-green-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiShoppingBag className="text-xl text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Products</p>
                          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FiPackage className="text-xl text-purple-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Total Users</p>
                          <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <FiUsers className="text-xl text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-sm text-gray-500">{order.user?.name || 'Customer'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary-500">Rs. {order.totalPrice.toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                      <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
                      <div className="space-y-4">
                        {['pending', 'processing', 'shipped', 'delivered'].map((status) => {
                          const count = orders.filter(o => o.status === status).length;
                          const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                          return (
                            <div key={status}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="capitalize text-gray-600">{status}</span>
                                <span className="font-medium">{count}</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    status === 'pending' ? 'bg-yellow-400' :
                                    status === 'processing' ? 'bg-blue-400' :
                                    status === 'shipped' ? 'bg-purple-400' : 'bg-green-400'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <button
                      onClick={() => { setShowProductForm(true); setEditingProduct(null); resetProductForm(); }}
                      className="btn btn-primary"
                    >
                      <FiPlus /> Add Product
                    </button>
                  </div>

                  {showProductForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          className="input"
                        />
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="input"
                        >
                          <option value="men">Men</option>
                          <option value="women">Women</option>
                          <option value="kids">Kids</option>
                          <option value="accessories">Accessories</option>
                          <option value="footwear">Footwear</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Price"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          className="input"
                        />
                        <input
                          type="number"
                          placeholder="Original Price (optional)"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="input"
                        />
                        <input
                          type="text"
                          placeholder="Brand"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="input"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          required
                          className="input"
                        />
                        <div className="md:col-span-2">
                          <textarea
                            placeholder="Description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            required
                            className="input min-h-[100px]"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Image URLs (comma separated)"
                            value={productForm.images}
                            onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                            className="input"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                            className="w-4 h-4 accent-primary-500"
                          />
                          <label htmlFor="featured" className="text-gray-700">Featured Product</label>
                        </div>
                        <div className="md:col-span-2 flex gap-4">
                          <button type="submit" className="btn btn-primary">
                            {editingProduct ? 'Update' : 'Create'} Product
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                            className="btn btn-outline"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">Product</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Price</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Stock</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {products.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.images?.[0] || 'https://via.placeholder.com/50'}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                  <span className="font-medium text-gray-800 line-clamp-1">{product.name}</span>
                                </div>
                              </td>
                              <td className="p-4 capitalize text-gray-600">{product.category}</td>
                              <td className="p-4 font-semibold text-gray-800">Rs. {product.price.toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                  product.stock > 10 ? 'bg-green-100 text-green-700' :
                                  product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>
                  
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">Order ID</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Customer</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Total</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="p-4 font-medium text-gray-800">#{order._id.slice(-6).toUpperCase()}</td>
                              <td className="p-4 text-gray-600">{order.user?.name || 'N/A'}</td>
                              <td className="p-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 font-semibold text-gray-800">Rs. {order.totalPrice.toLocaleString()}</td>
                              <td className="p-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(order.status)}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                                  <FiEye />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Users</h1>
                  
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-gray-600">User</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                            <th className="text-left p-4 font-semibold text-gray-600">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="font-semibold text-primary-500">{u.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <span className="font-medium text-gray-800">{u.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600">{u.email}</td>
                              <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
