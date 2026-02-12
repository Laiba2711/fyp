import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <footer className="bg-dark-100 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-extrabold text-primary-500 tracking-wider">LGES</span>
              <span className="block text-xs text-gray-400 uppercase tracking-[3px]">Fashion</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Your one-stop destination for trendy fashion. We bring you the latest styles with quality and affordability.
            </p>
            <div className="flex gap-4">
              {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-primary-500 hover:text-white transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary-500">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'All Products', path: '/products' },
                { name: 'Men', path: '/products?category=men' },
                { name: 'Women', path: '/products?category=women' },
                { name: 'Kids', path: '/products?category=kids' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-500 hover:translate-x-1 inline-block transition-all">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary-500">
              Customer Service
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Contact Us', path: '/contact' },
                { name: 'FAQ', path: '/faq' },
                { name: 'Shipping Info', path: '/shipping' },
                { name: 'Returns & Exchange', path: '/returns' },
                { name: 'Size Guide', path: '/size-guide' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-primary-500 hover:translate-x-1 inline-block transition-all">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary-500">
              Contact Info
            </h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 text-gray-400">
                <FiMapPin className="text-primary-500 mt-1 flex-shrink-0" />
                <span>GCUF, Faisalabad, Punjab, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-primary-500" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiMail className="text-primary-500" />
                <span>support@lgesfashion.com</span>
              </li>
            </ul>

            <h4 className="font-medium mb-3">Subscribe to Newsletter</h4>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-primary-500 transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors ">
                Subscribe
              </button>
            </form>
            
            {/* Theme Toggle */}
            <div className="mt-4">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors neon-glow"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
            <p>&copy; 2026 LGES Fashion. All Rights Reserved.</p>
            <p>Developed by Laiba, Rimsha, Areeba & Malaika - GCUF FYP</p>
            <div className="flex items-center gap-3">
              <span>We Accept:</span>
              <img src="https://cdn-icons-png.flaticon.com/32/349/349221.png" alt="Visa" className="h-6 opacity-70 hover:opacity-100" />
              <img src="https://cdn-icons-png.flaticon.com/32/349/349228.png" alt="Mastercard" className="h-6 opacity-70 hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
