import { Link } from 'react-router-dom';
import { FiSearch, FiArrowRight } from 'react-icons/fi';

const SearchSuggestions = ({ suggestions, query, onSelect }) => {
    if (!suggestions || (!suggestions.products?.length && !suggestions.categories?.length && !suggestions.brands?.length)) {
        return null;
    }

    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="text-primary-500 font-bold">{part}</span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-fadeIn">
            {/* Categories & Brands */}
            {(suggestions.categories?.length > 0 || suggestions.brands?.length > 0) && (
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map((cat) => (
                            <Link
                                key={cat}
                                to={`/products?category=${cat}`}
                                onClick={onSelect}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-1"
                            >
                                Category: {highlightText(cat, query)}
                            </Link>
                        ))}
                        {suggestions.brands.map((brand) => (
                            <Link
                                key={brand}
                                to={`/products?brand=${brand}`}
                                onClick={onSelect}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-primary-500 hover:text-primary-500 transition-all"
                            >
                                Brand: {highlightText(brand, query)}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Products */}
            {suggestions.products?.length > 0 && (
                <div className="py-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</div>
                    {suggestions.products.map((product) => (
                        <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            onClick={onSelect}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate group-hover:text-primary-500 transition-colors">
                                    {highlightText(product.name, query)}
                                </div>
                                <div className="text-xs text-primary-500 font-bold">Rs. {product.price?.toLocaleString()}</div>
                            </div>
                            <FiArrowRight className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Link>
                    ))}
                </div>
            )}

            {/* Popular / Trending Suggestions */}
            {suggestions.popular?.length > 0 && (
                <div className="p-4 border-t border-gray-50">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trending Searches</div>
                    <div className="space-y-2">
                        {suggestions.popular.map((item) => (
                            <Link
                                key={item}
                                to={`/products?search=${item}`}
                                onClick={onSelect}
                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 transition-colors"
                            >
                                <FiSearch size={12} className="text-gray-400" />
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Link
                to={`/products?search=${query}`}
                onClick={onSelect}
                className="block bg-primary-500 p-3 text-center text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
                View all results for "{query}"
            </Link>
        </div>
    );
};

export default SearchSuggestions;
