import { useState, useEffect } from 'react';
import {
    FiDollarSign, FiShoppingBag, FiTrendingUp, FiBox, FiPieChart,
    FiCreditCard, FiArrowUpRight, FiCalendar
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { analyticsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SalesAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchStats();
    }, [days]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await analyticsAPI.getSalesStats(days);
            setStats(data);
        } catch (error) {
            toast.error('Failed to fetch sales analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const { overview, salesTrend, categoryStats, topProducts, paymentStats } = stats;

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Sales Analytics</h2>
                    <p className="text-gray-500 text-sm">Real-time performance metrics</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {[7, 30, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${days === d
                                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                            <FiDollarSign size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            <FiArrowUpRight /> +12.5%
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        Rs. {overview.totalRevenue.toLocaleString()}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                            <FiShoppingBag size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            <FiArrowUpRight /> +8.2%
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        {overview.totalOrders.toLocaleString()}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <FiTrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Avg. Order Value</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        Rs. {Math.round(overview.aov).toLocaleString()}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Volume Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiCalendar className="text-primary-500" /> Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Revenue Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiPieChart className="text-primary-500" /> Revenue by Category
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="revenue"
                                        nameKey="_id"
                                    >
                                        {categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 w-full md:w-auto">
                            {categoryStats.map((item, index) => (
                                <div key={item._id} className="flex items-center justify-between md:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-sm font-medium text-gray-600 capitalize">{item._id}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">
                                        {Math.round((item.revenue / overview.totalRevenue) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Products */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiBox className="text-primary-500" /> Top Selling Products
                    </h3>
                    <div className="space-y-5">
                        {topProducts.map((product, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                    <p className="text-xs text-gray-400">{product.sold} units sold</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-primary-500">Rs. {product.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Support */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 neon-card">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FiCreditCard className="text-primary-500" /> Payment Methods
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={paymentStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="_id"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 600 }}
                                width={100}
                                tickFormatter={(val) => val.toUpperCase()}
                            />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#3b82f6"
                                radius={[0, 10, 10, 0]}
                                barSize={20}
                                name="Orders"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {paymentStats.map((item, index) => (
                            <div key={item._id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item._id}</p>
                                <p className="text-sm font-bold text-gray-800">Rs. {item.revenue.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalytics;
