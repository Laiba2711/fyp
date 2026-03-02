const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const SearchLog = require('../models/SearchLog');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get search analytics overview
// @route   GET /api/analytics/search/stats
// @access  Private/Admin
router.get('/search/stats', protect, admin, async (req, res) => {
    try {
        const period = Number(req.query.days) || 30;
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - period);

        const [topKeywords, noResults, dailyVolume, sourceStats] = await Promise.all([
            SearchLog.aggregate([
                { $match: { timestamp: { $gte: dateLimit } } },
                { $group: { _id: { $toLower: "$query" }, count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            SearchLog.aggregate([
                { $match: { timestamp: { $gte: dateLimit }, resultsCount: 0 } },
                { $group: { _id: { $toLower: "$query" }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            SearchLog.aggregate([
                { $match: { timestamp: { $gte: dateLimit } } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            SearchLog.aggregate([
                { $match: { timestamp: { $gte: dateLimit } } },
                { $group: { _id: "$source", count: { $sum: 1 } } }
            ])
        ]);

        res.json({ topKeywords, noResults, dailyVolume, sourceStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales/stats
// @access  Private/Admin
router.get('/sales/stats', protect, admin, async (req, res) => {
    try {
        const period = Number(req.query.days) || 30;
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - period);

        const matchFilter = {
            createdAt: { $gte: dateLimit },
            status: { $ne: 'cancelled' }
        };

        const [overview, salesTrend, categoryStats, topProducts, paymentStats] = await Promise.all([
            // 1. Overview stats
            Order.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$totalPrice" },
                        totalOrders: { $sum: 1 },
                        aov: { $avg: "$totalPrice" }
                    }
                }
            ]),

            // 2. Sales Trend (Line Chart)
            Order.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$totalPrice" },
                        orders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // 3. Category Distribution (Pie Chart)
            Order.aggregate([
                { $match: matchFilter },
                { $unwind: "$orderItems" },
                {
                    $lookup: {
                        from: "products",
                        localField: "orderItems.product",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                { $unwind: "$productInfo" },
                {
                    $group: {
                        _id: "$productInfo.category",
                        revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
                        count: { $sum: "$orderItems.quantity" }
                    }
                },
                { $sort: { revenue: -1 } }
            ]),

            // 4. Top Products
            Order.aggregate([
                { $match: matchFilter },
                { $unwind: "$orderItems" },
                {
                    $group: {
                        _id: "$orderItems.product",
                        name: { $first: "$orderItems.name" },
                        image: { $first: "$orderItems.image" },
                        sold: { $sum: "$orderItems.quantity" },
                        revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                    }
                },
                { $sort: { sold: -1 } },
                { $limit: 8 }
            ]),

            // 5. Payment Methods (Donut Chart)
            Order.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: "$paymentMethod",
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalPrice" }
                    }
                }
            ])
        ]);

        res.json({
            overview: overview[0] || { totalRevenue: 0, totalOrders: 0, aov: 0 },
            salesTrend,
            categoryStats,
            topProducts,
            paymentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
