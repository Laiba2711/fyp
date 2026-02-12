import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Local storage key for guest cart
  const GUEST_CART_KEY = 'guest_cart';

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await cartAPI.get();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, size = '', color = '') => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { data } = await cartAPI.addItem({
          productId: product._id,
          quantity,
          size,
          color,
        });
        setCart(data);
        toast.success('Added to cart!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart
      const newItem = {
        _id: `${product._id}-${size}-${color}-${Date.now()}`,
        product,
        quantity,
        size,
        color,
        price: product.price,
      };

      const existingIndex = cart.items.findIndex(
        (item) =>
          item.product._id === product._id &&
          item.size === size &&
          item.color === color
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = cart.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...cart.items, newItem];
      }

      const newCart = {
        items: newItems,
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      setCart(newCart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
      toast.success('Added to cart!');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { data } = await cartAPI.updateItem(itemId, { quantity });
        setCart(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update cart');
      } finally {
        setLoading(false);
      }
    } else {
      const newItems = quantity <= 0
        ? cart.items.filter((item) => item._id !== itemId)
        : cart.items.map((item) =>
            item._id === itemId ? { ...item, quantity } : item
          );

      const newCart = {
        items: newItems,
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      setCart(newCart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const { data } = await cartAPI.removeItem(itemId);
        setCart(data);
        toast.success('Item removed from cart');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to remove item');
      } finally {
        setLoading(false);
      }
    } else {
      const newItems = cart.items.filter((item) => item._id !== itemId);
      const newCart = {
        items: newItems,
        totalPrice: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };

      setCart(newCart);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
      toast.success('Item removed from cart');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartAPI.clear();
        setCart({ items: [], totalPrice: 0 });
        toast.success('Cart cleared');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to clear cart');
      } finally {
        setLoading(false);
      }
    } else {
      setCart({ items: [], totalPrice: 0 });
      localStorage.removeItem(GUEST_CART_KEY);
      toast.success('Cart cleared');
    }
  };

  const cartCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
