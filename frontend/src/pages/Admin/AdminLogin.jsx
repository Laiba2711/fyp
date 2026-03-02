import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Check if the logged in user is actually an admin
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.role === 'admin') {
                toast.success('Admin access granted');
                navigate('/admin');
            } else {
                toast.error('Access denied. Admin credentials required.');
                // We might want to logout or just notify
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-dark-100 p-10 rounded-2xl shadow-2xl border border-white/5 neon-card">
                <div>
                    <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/50">
                        <FiShield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white neon-glow">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Secure administrative access only
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="relative">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-12 py-3 bg-dark-200 border border-white/10 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Admin Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="appearance-none relative block w-full px-12 py-3 bg-dark-200 border border-white/10 placeholder-gray-500 text-white rounded-xl focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm transition-all"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Authorize Access'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <Link to="/" className="text-sm font-medium text-gray-500 hover:text-primary-500 transition-colors">
                        Return to Storefront
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
