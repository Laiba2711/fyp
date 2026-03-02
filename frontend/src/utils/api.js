import axios from 'axios';
import { mockProductsAPI } from '../services/mockProducts';

const API_URL = 'http://localhost:5000/api';

// Flag to switch between real API and mock data
const USE_MOCK_DATA = false; // Set to true to use mock data

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addToWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}`),
  getAllUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// Products API
export const productsAPI = {
  getAll: async (params) => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getAll(params);
    }
    try {
      return await api.get('/products', { params });
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getAll(params);
    }
  },
  getFeatured: async () => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getFeatured();
    }
    try {
      return await api.get('/products/featured');
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getFeatured();
    }
  },
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getById: async (id) => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getById(id);
    }
    try {
      return await api.get(`/products/${id}`);
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getById(id);
    }
  },
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  getRecommendations: async (id) => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getRecommendations(id);
    }
    try {
      return await api.get(`/products/${id}/recommendations`);
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getRecommendations(id);
    }
  },
  // New endpoints
  getCategoriesWithStats: async () => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getCategoriesWithStats();
    }
    try {
      return await api.get('/products/categories/stats');
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getCategoriesWithStats();
    }
  },
  getPriceStats: async () => {
    if (USE_MOCK_DATA) {
      return mockProductsAPI.getPriceStats();
    }
    try {
      return await api.get('/products/price-stats');
    } catch (error) {
      console.warn('API not available, falling back to mock data');
      return mockProductsAPI.getPriceStats();
    }
  },
  getByTag: (tag) => api.get(`/products/tag/${tag}`),
  getByBrand: (brand) => api.get(`/products/brand/${brand}`),
  searchAdvanced: (params) => api.get('/products/search/advanced', { params }),
  smartSearch: (params) => api.get('/products/smart-search', { params }),
  getSuggestions: (params) => api.get('/products/search/suggestions', { params }),
  getSmartSuggestions: (id) => api.get(`/products/${id}/smart-suggestions`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/myorders'),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/admin/stats'),
};

// Analytics API
export const analyticsAPI = {
  getSearchStats: (days) => api.get('/analytics/search/stats', { params: { days } }),
  getSalesStats: (days) => api.get('/analytics/sales/stats', { params: { days } }),
  // Reporting
  getSalesReport: (params) => api.get('/admin/reports/sales', { params, responseType: 'blob' }),
  getCityReport: () => api.get('/admin/reports/city', { responseType: 'blob' }),
  getAbandonedReport: () => api.get('/admin/reports/abandoned', { responseType: 'blob' }),
};

// Chat API (Chatbot)
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (params) => api.get('/chat/history', { params }),
  getHistoryBySession: (sessionId) => api.get(`/chat/history/${sessionId}`),
  markFAQHelpful: (faqId, helpful) => api.post(`/chat/faq/${faqId}/helpful`, { helpful }),
  getAllFAQs: (params) => api.get('/chat/faqs', { params }),
  getFAQById: (id) => api.get(`/chat/faqs/${id}`),
  createTicket: (data) => {
    // supports JSON or FormData (with attachments)
    if (data instanceof FormData) {
      return api.post('/chat/ticket', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/chat/ticket', data);
  },
  getMyTickets: () => api.get('/chat/tickets/user'),
  getTicketById: (id) => api.get(`/chat/tickets/${id}`),
  postTicketMessage: (ticketId, data) => api.post(`/chat/tickets/${ticketId}/message`, data),
  // Order tracking endpoints
  trackOrder: (data) => api.post('/chat/track-order', data),
  getOrderById: (orderId) => api.get(`/chat/order/${orderId}`),
  getOrderByIdUser: (orderId) => api.get(`/chat/order/${orderId}/user`),
  // Admin endpoints
  getAllTickets: (params) => api.get('/chat/tickets/admin', { params }),
  updateTicketStatus: (id, data) => api.put(`/chat/tickets/${id}/status`, data),
  createFAQ: (data) => api.post('/chat/faqs/admin/create', data),
  updateFAQ: (id, data) => api.put(`/chat/faqs/${id}/admin/update`, data),
  deleteFAQ: (id) => api.delete(`/chat/faqs/${id}/admin/delete`, data),
  // Order tracking helpers
  getOrderPublic: (orderId) => api.get(`/chat/order/${orderId}`),
  getOrderPrivate: (orderId) => api.get(`/chat/order/${orderId}/user`),
};

export default api;
