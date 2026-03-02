import { useState } from 'react';
import { FiDownload, FiFileText, FiMapPin, FiShoppingCart, FiCalendar, FiLoader } from 'react-icons/fi';
import { analyticsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Reports = () => {
    const [downloading, setDownloading] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const handleDownload = async (type) => {
        try {
            setDownloading(type);
            let response;
            let filename;

            if (type === 'sales') {
                response = await analyticsAPI.getSalesReport(dateRange);
                filename = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`;
            } else if (type === 'city') {
                response = await analyticsAPI.getCityReport();
                filename = `city-sales-performance.xlsx`;
            } else if (type === 'abandoned') {
                response = await analyticsAPI.getAbandonedReport();
                filename = `abandoned-carts-report.pdf`;
            }

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`${type.toUpperCase()} report downloaded!`);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate report');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Business Reports</h2>
                    <p className="text-gray-500 text-sm">Generate and export detailed business performance data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sales Report Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 neon-card flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                        <FiFileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Sales Report</h3>
                    <p className="text-gray-500 text-sm mb-6">Complete transaction history, revenue summary, and order details in PDF format.</p>

                    <div className="w-full space-y-4 mb-8">
                        <div className="flex flex-col items-start gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="w-full p-2 border border-gray-100 rounded-lg text-sm outline-none focus:border-primary-500"
                            />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="w-full p-2 border border-gray-100 rounded-lg text-sm outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => handleDownload('sales')}
                        disabled={downloading}
                        className="w-full py-3 bg-dark-100 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {downloading === 'sales' ? <FiLoader className="animate-spin" /> : <FiDownload className="group-hover:translate-y-1 transition-transform" />}
                        Download PDF
                    </button>
                </div>

                {/* City-wise Performance Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 neon-card flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                        <FiMapPin size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">City Performance</h3>
                    <p className="text-gray-500 text-sm mb-6">Regional sales distribution and geographic performance metrics in Excel format.</p>

                    <div className="mt-auto w-full">
                        <button
                            onClick={() => handleDownload('city')}
                            disabled={downloading}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {downloading === 'city' ? <FiLoader className="animate-spin" /> : <FiDownload className="group-hover:translate-y-1 transition-transform" />}
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Abandoned Cart Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 neon-card flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                        <FiShoppingCart size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Cart Abandonment</h3>
                    <p className="text-gray-500 text-sm mb-6">Track lost opportunities and discover potential revenue left in inactive carts.</p>

                    <div className="mt-auto w-full">
                        <button
                            onClick={() => handleDownload('abandoned')}
                            disabled={downloading}
                            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {downloading === 'abandoned' ? <FiLoader className="animate-spin" /> : <FiDownload className="group-hover:translate-y-1 transition-transform" />}
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FiCalendar size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-blue-800">Automated Financial Summaries</h4>
                    <p className="text-blue-600/80 text-sm mt-1">
                        Reports are generated in real-time. For large date ranges, processing may take a few seconds as the system aggregates live transaction data and generates the document stream.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
