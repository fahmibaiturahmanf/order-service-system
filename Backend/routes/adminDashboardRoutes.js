// Backend/routes/adminDashboardRoutes.js
const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController'); // Pastikan path ini benar
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); // Pastikan path ini benar

// Dashboard data endpoints (hanya untuk admin dan direktur)
router.get('/pending-payments-count', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getPendingPaymentsCount);
router.get('/monthly-orders-count', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getMonthlyOrdersCount);
router.get('/total-users-count', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getTotalUsersCount);
router.get('/recent-orders', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getRecentOrders);
router.get('/monthly-order-trends', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getMonthlyOrderTrends);
router.get('/order-status-distribution', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getOrderStatusDistribution);
router.get('/recap-summary', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getDashboardRecap); // Menggunakan nama yang lebih generik

// Routes untuk HTML Recap (yang akan di-render oleh Puppeteer)
router.get('/rekap-html/:year/:month', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.getRecapHtml);

// Routes untuk Generate PDF
router.get('/generate-pdf/:year/:month', authenticate, authorizeRole(['admin', 'direktur']), adminDashboardController.generatePdfRecap);

module.exports = router;
