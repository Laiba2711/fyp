import { useState, useEffect } from 'react';
import { FiSearch, FiTrendingUp, FiAlertCircle, FiActivity, FiGlobe } from 'react-icons/fi';
import { analyticsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const SearchAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchStats();
    }, [days]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await analyticsAPI.getSearchStats(days);
            setStats(data);
        } catch (error) {
            toast.error('Failed to fetch analytics');
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

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Search Analytics</h2>
                    <p className="text-gray-500 text-sm">Monitor how users are finding your products</p>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 90 Days</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Searched Keywords */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 neon-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                            <FiTrendingUp size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Top Keywords</h3>
                    </div>
                    <div className="space-y-4">
                        {stats?.topKeywords.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 relative">
                                <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700 capitalize">{item._id}</span>
                                        <span className="text-gray-500 font-bold">{item.count} searches</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${(item.count / stats.topKeywords[0].count) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No Results - The Opportunity Board */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 neon-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                            <FiAlertCircle size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800">Unmet Demands (No Results)</h3>
                    </div>
                    <div className="space-y-4">
                        {stats?.noResults.length > 0 ? stats.noResults.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700 capitalize">{item._id}</span>
                                        <span className="text-red-500 font-bold">{item.count} fails</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-400"
                                            style={{ width: `${(item.count / stats.noResults[0].count) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-gray-400 italic">No search failures recorded!</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Daily Volume Visualizer */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 neon-card">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                        <FiActivity size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Search Volume Trend</h3>
                </div>

                <div className="h-48 flex items-end gap-2 px-2 border-b border-l border-gray-100">
                    {stats?.dailyVolume.map((day, index) => {
                        const maxVal = Math.max(...stats.dailyVolume.map(d => d.count), 1);
                        return (
                            <div key={index} className="flex-1 group relative">
                                <div
                                    className="bg-primary-500/80 hover:bg-primary-500 rounded-t-sm transition-all cursor-pointer"
                                    style={{ height: `${(day.count / maxVal) * 100}%` }}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-dark-100 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                                        {day._id}: {day.count}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                    <span>{stats?.dailyVolume[0]?._id}</span>
                    <span>{stats?.dailyVolume[Math.floor(stats.dailyVolume.length / 2)]?._id}</span>
                    <span>{stats?.dailyVolume[stats.dailyVolume.length - 1]?._id}</span>
                </div>
            </div>

            {/* Source Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats?.sourceStats.map(stat => (
                    <div key={stat._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-gray-50 text-gray-500 rounded-xl">
                            <FiGlobe size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat._id} Traffic</p>
                            <h4 className="text-xl font-bold text-gray-800">{stat.count}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchAnalytics;
