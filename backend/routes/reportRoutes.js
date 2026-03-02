const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Generate Sales Report (PDF)
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
router.get('/sales', protect, admin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {
            createdAt: {
                $gte: new Date(startDate || new Date().setDate(new Date().getDate() - 30)),
                $lte: new Date(endDate || new Date())
            },
            status: { $ne: 'cancelled' }
        };

        const orders = await Order.find(query).populate('user', 'name email').sort('-createdAt');

        const doc = new PDFDocument({ margin: 50 });

        // Response headers for PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
        doc.pipe(res);

        // Header / Branding
        doc.fontSize(25).text('LUXURY WEAR', { align: 'center' });
        doc.fontSize(10).text('Official Sales Report', { align: 'center' });
        doc.moveDown();
        doc.strokeColor('#eeeeee').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Summary Stats
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const avgOrder = totalRevenue / (orders.length || 1);

        doc.fontSize(12).font('Helvetica-Bold').text('Report Summary');
        doc.font('Helvetica').fontSize(10).text(`Period: ${startDate || 'Last 30 Days'} to ${endDate || 'Today'}`);
        doc.text(`Total Orders: ${orders.length}`);
        doc.text(`Total Revenue: Rs. ${totalRevenue.toLocaleString()}`);
        doc.text(`Average Order Value: Rs. ${Math.round(avgOrder).toLocaleString()}`);
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Order ID', 50, tableTop);
        doc.text('Customer', 150, tableTop);
        doc.text('Date', 300, tableTop);
        doc.text('Method', 400, tableTop);
        doc.text('Amount', 500, tableTop);

        doc.moveDown();
        doc.strokeColor('#eeeeee').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table Rows
        doc.font('Helvetica').fontSize(9);
        orders.forEach(order => {
            const y = doc.y;
            if (y > 700) doc.addPage();

            doc.text(order._id.toString().slice(-8).toUpperCase(), 50, y);
            doc.text(order.user?.name || 'Guest', 150, y, { width: 140 });
            doc.text(new Date(order.createdAt).toLocaleDateString(), 300, y);
            doc.text(order.paymentMethod.toUpperCase(), 400, y);
            doc.text(`Rs. ${order.totalPrice.toLocaleString()}`, 500, y);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Generate City-wise Report (Excel)
// @route   GET /api/admin/reports/city
// @access  Private/Admin
router.get('/city', protect, admin, async (req, res) => {
    try {
        const stats = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $toUpper: "$shippingAddress.city" },
                    orderCount: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" },
                    avgOrderValue: { $avg: "$totalPrice" }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('City Sales Performance');

        sheet.columns = [
            { header: 'City', key: 'city', width: 25 },
            { header: 'Total Orders', key: 'orders', width: 15 },
            { header: 'Total Revenue (Rs.)', key: 'revenue', width: 20 },
            { header: 'Avg. Order Value', key: 'aov', width: 20 }
        ];

        // Styling headers
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        stats.forEach(item => {
            sheet.addRow({
                city: item._id,
                orders: item.orderCount,
                revenue: item.totalRevenue,
                aov: Math.round(item.avgOrderValue)
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=city-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Generate Abandoned Cart Report (PDF)
// @route   GET /api/admin/reports/abandoned
// @access  Private/Admin
router.get('/abandoned', protect, admin, async (req, res) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const abandonedCarts = await Cart.find({
            updatedAt: { $lt: yesterday },
            items: { $not: { $size: 0 } }
        }).populate('user', 'name email');

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=abandoned-carts.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Abandoned Cart Insights', { align: 'center' });
        doc.fontSize(10).text('Carts older than 24 hours with items', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).font('Helvetica-Bold').text(`Total Potential Lost Revenue: Rs. ${abandonedCarts.reduce((s, c) => s + c.totalPrice, 0).toLocaleString()}`);
        doc.moveDown();

        abandonedCarts.forEach((cart, i) => {
            if (doc.y > 700) doc.addPage();

            doc.font('Helvetica-Bold').fontSize(11).text(`${i + 1}. Customer: ${cart.user?.name || 'Unknown'}`);
            doc.font('Helvetica').fontSize(10).text(`Email: ${cart.user?.email || 'N/A'}`);
            doc.text(`Last Activity: ${new Date(cart.updatedAt).toLocaleString()}`);
            doc.text(`Items: ${cart.items.length} | Potential Value: Rs. ${cart.totalPrice.toLocaleString()}`);
            doc.moveDown(0.5);
            doc.strokeColor('#f0f0f0').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
