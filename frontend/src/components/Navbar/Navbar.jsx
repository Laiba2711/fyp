import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch, FiHeart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { productsAPI } from '../../utils/api';
import SearchSuggestions from './SearchSuggestions';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const { data } = await productsAPI.getSuggestions(searchQuery);
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSuggestions(null);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const categories = [
    { name: 'Men', path: '/products?category=men' },
    { name: 'Women', path: '/products?category=women' },
    { name: 'Kids', path: '/products?category=kids' },
    { name: 'Accessories', path: '/products?category=accessories' },
    { name: 'Footwear', path: '/products?category=footwear' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-2xl lg:text-3xl font-extrabold text-primary-500 tracking-wider">LGES</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-[3px]">Fashion</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="text-gray-700 font-medium hover:text-primary-500 transition-colors relative group"
              >
                {category.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                className="text-gray-700 font-medium hover:text-primary-500 transition-colors relative group"
              >
                More
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
              </button>

              {isMoreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 z-50">
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/shipping"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  >
                    Shipping Info
                  </Link>
                  <Link
                    to="/returns"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  >
                    Returns & Exchange
                  </Link>
                  <Link
                    to="/size-guide"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                    onClick={() => setIsMoreDropdownOpen(false)}
                  >
                    Size Guide
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-500">
                <FiSearch />
              </button>
            </div>
            {showSuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                query={searchQuery}
                onSelect={() => setShowSuggestions(false)}
              />
            )}
          </form>

          {/* Icons */}
          <div className="flex items-center gap-3 lg:gap-4">
            {isAuthenticated && (
              <Link to="/wishlist" className="text-gray-700 hover:text-primary-500 text-xl p-2" title="Wishlist">
                <FiHeart />
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-gray-700 hover:text-primary-500 text-xl p-2 transition-all duration-300 neon-glow"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <Link to="/cart" className="relative text-gray-700 hover:text-primary-500 text-xl p-2" title="Cart">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-primary-500 p-2"
                >
                  <FiUser className="text-xl" />
                  <span className="hidden lg:inline text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 animate-fadeIn">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-500"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-primary-500 text-xl p-2" title="Login">
                <FiUser />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-gray-700 text-2xl p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden bg-white border-t border-gray-100 ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-4 space-y-4">
          <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-l-full outline-none"
              />
              <button type="submit" className="px-5 bg-primary-500 text-white rounded-r-full">
                <FiSearch />
              </button>
            </form>
            {showSuggestions && (
              <SearchSuggestions
                suggestions={suggestions}
                query={searchQuery}
                onSelect={() => {
                  setShowSuggestions(false);
                  setIsMenuOpen(false);
                }}
              />
            )}
          </div>

          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="block py-3 text-gray-700 font-medium border-b border-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}

          {/* Mobile More Dropdown */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
              className="w-full text-left py-3 text-gray-700 font-medium flex justify-between items-center"
            >
              More
              <span className={`${isMoreDropdownOpen ? 'rotate-180' : ''} transition-transform`}>▼</span>
            </button>

            {isMoreDropdownOpen && (
              <div className="pl-4 space-y-2 py-2 border-t border-gray-100">
                <Link
                  to="/contact"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMoreDropdownOpen(false);
                  }}
                >
                  Contact Us
                </Link>
                <Link
                  to="/faq"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMoreDropdownOpen(false);
                  }}
                >
                  FAQ
                </Link>
                <Link
                  to="/shipping"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMoreDropdownOpen(false);
                  }}
                >
                  Shipping Info
                </Link>
                <Link
                  to="/returns"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMoreDropdownOpen(false);
                  }}
                >
                  Returns & Exchange
                </Link>
                <Link
                  to="/size-guide"
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMoreDropdownOpen(false);
                  }}
                >
                  Size Guide
                </Link>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="block py-3 text-primary-500 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
