import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiPlus } from 'react-icons/fi';
import { productsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';

const Products = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [priceStats, setPriceStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1,
    tags: searchParams.get('tags') || '',
    brand: searchParams.get('brand') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') === 'true',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page')) || 1,
      tags: searchParams.get('tags') || '',
      brand: searchParams.get('brand') || '',
      minRating: searchParams.get('minRating') || '',
    });
  }, [searchParams]);

  useEffect(() => {
    fetchPriceStats();
    fetchCategoryStats();
  }, []);

  const fetchPriceStats = async () => {
    try {
      const response = await productsAPI.getPriceStats();
      setPriceStats(response.data);
    } catch (error) {
      console.error('Error fetching price stats:', error);
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
        q: filters.search
      };

      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.inStock) params.inStock = true;

      const response = await productsAPI.smartSearch(params);

      setProducts(response.data.products);
      setTotalPages(response.data.pages);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '' && k !== 'page') {
        params.set(k, v);
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: '',
      page: 1,
      tags: '',
      brand: '',
      minRating: '',
      inStock: false,
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'kids', label: 'Kids' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'footwear', label: 'Footwear' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  const priceRanges = [
    { min: '', max: '', label: 'All Prices' },
    { min: '0', max: '1000', label: 'Under Rs. 1,000' },
    { min: '1000', max: '3000', label: 'Rs. 1,000 - 3,000' },
    { min: '3000', max: '5000', label: 'Rs. 3,000 - 5,000' },
    { min: '5000', max: '10000', label: 'Rs. 5,000 - 10,000' },
    { min: '10000', max: '', label: 'Over Rs. 10,000' },
  ];

  const dynamicPriceRanges = priceStats ? [
    { min: '', max: '', label: `All Prices (Rs. ${priceStats.minPrice} - Rs. ${priceStats.maxPrice})` },
    { min: priceStats.minPrice.toString(), max: Math.floor(priceStats.avgPrice).toString(), label: `Budget (Under Rs. ${Math.floor(priceStats.avgPrice)})` },
    { min: Math.floor(priceStats.avgPrice).toString(), max: Math.ceil(priceStats.avgPrice * 1.5).toString(), label: `Mid-range (Rs. ${Math.floor(priceStats.avgPrice)} - Rs. ${Math.ceil(priceStats.avgPrice * 1.5)})` },
    { min: Math.ceil(priceStats.avgPrice * 1.5).toString(), max: priceStats.maxPrice.toString(), label: `Premium (Above Rs. ${Math.ceil(priceStats.avgPrice * 1.5)})` },
  ] : null;

  const activeFiltersCount = [
    filters.category,
    filters.minPrice || filters.maxPrice,
    filters.tags,
    filters.brand,
    filters.minRating
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-dark-100 to-dark-200 py-12 text-center text-white neon-card">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 neon-glow">
          {filters.search
            ? `Search Results for "${filters.search}"`
            : filters.category
              ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}'s Collection`
              : 'All Products'}
        </h1>
        <p className="text-gray-300 mb-4">{total} products found</p>
        {isAdmin && (
          <Link
            to="/admin"
            state={{ activeTab: 'products', showProductForm: true }}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-primary-500/30"
          >
            <FiPlus /> Add New Product
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            className="lg:hidden flex items-center justify-center gap-2 py-3 bg-dark-100 text-white rounded-lg font-medium neon-glow"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          {/* Sidebar Filters */}
          <aside
            className={`lg:w-72 bg-white rounded-xl p-6 shadow-sm h-fit lg:sticky lg:top-24 neon-card ${showFilters ? 'block' : 'hidden lg:block'
              }`}
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 neon-glow">Filters</h3>
              <button className="lg:hidden text-gray-500" onClick={() => setShowFilters(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Category</h4>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catStat = categoryStats.find(c => c._id === cat.value);
                  return (
                    <label key={cat.value} className="flex items-center justify-between gap-3 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === cat.value}
                          onChange={() => updateFilters('category', cat.value)}
                          className="w-4 h-4 accent-primary-500"
                        />
                        <span className="text-gray-600 group-hover:text-primary-500 transition-colors">{cat.label}</span>
                      </div>
                      {catStat && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{catStat.count}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Price Range</h4>
              <div className="space-y-2">
                {(dynamicPriceRanges || priceRanges).map((range, index) => (
                  <label key={index} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="price"
                      checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                      onChange={() => {
                        setFilters({ ...filters, minPrice: range.min, maxPrice: range.max, page: 1 });
                      }}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className="text-gray-600 group-hover:text-primary-500 transition-colors">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Availability</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => updateFilters('inStock', e.target.checked)}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-gray-600 group-hover:text-primary-500 transition-colors">In Stock Only</span>
              </label>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Brand</h4>
              <input
                type="text"
                placeholder="Search brand..."
                value={filters.brand || ''}
                onChange={(e) => updateFilters('brand', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500 neon-glow"
              />
            </div>

            {/* Tags Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Tags</h4>
              <input
                type="text"
                placeholder="Search tags..."
                value={filters.tags}
                onChange={(e) => updateFilters('tags', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500 neon-glow"
              />
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Minimum Rating</h4>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="rating"
                      checked={parseInt(filters.minRating) === rating}
                      onChange={() => updateFilters('minRating', rating.toString())}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-gray-600 group-hover:text-primary-500 transition-colors">& Up</span>
                    </div>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={!filters.minRating || filters.minRating === ''}
                    onChange={() => updateFilters('minRating', '')}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="text-gray-600 group-hover:text-primary-500 transition-colors">Any Rating</span>
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full py-3 bg-gray-100 text-primary-500 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-colors neon-glow"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm neon-card">
              <span className="text-gray-600 neon-glow">
                Showing {products.length} of {total} products
              </span>
              <div className="flex items-center gap-3">
                <label className="text-gray-600">Sort by:</label>
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters('sort', e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg outline-none focus:border-primary-500 cursor-pointer neon-glow"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} onDelete={() => fetchProducts()} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10 flex-wrap">
                    <button
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-50 neon-glow"
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page - 1)}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`px-4 py-2 rounded-lg transition-colors neon-glow ${filters.page === index + 1
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-200 hover:border-primary-500 hover:text-primary-500'
                          }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-50 neon-glow"
                      disabled={filters.page === totalPages}
                      onClick={() => handlePageChange(filters.page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl neon-card">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 neon-glow">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary neon-glow">
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Category Statistics Visualization */}
      {categoryStats.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 neon-glow">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryStats.map((stat) => (
              <Link
                key={stat._id}
                to={`/products?category=${stat._id}`}
                className="group relative rounded-xl overflow-hidden aspect-square bg-white p-4 flex flex-col items-center justify-center text-center neon-card hover:scale-105 transition-transform"
              >
                <div className="text-2xl font-bold text-primary-500 mb-1">{stat.count}</div>
                <div className="font-semibold text-gray-800 capitalize">{stat._id}</div>
                <div className="text-xs text-gray-500 mt-1">products</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
