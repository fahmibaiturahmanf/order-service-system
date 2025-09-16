const express = require('express');
const router = express.Router();
const {
  getPendingPaymentsCount,
  getMonthlyOrdersCount,
  getTotalUsersCount,
  getRecentOrders,
  getDashboardRecap,
  getRecapHtml,
  generatePdfRecap,
  getMonthlyOrderTrends,
  getOrderStatusDistribution
} = require('../controllers/direkturDashboardController');

const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

// Semua route ini hanya untuk direktur
router.use(authenticate, authorizeRole(['direktur']));

router.get('/pending-payments-count', getPendingPaymentsCount);
router.get('/monthly-orders-count', getMonthlyOrdersCount);
router.get('/total-users-count', getTotalUsersCount);
router.get('/recent-orders', getRecentOrders);
router.get('/recap', getDashboardRecap);
router.get('/rekap-html/:year/:month', getRecapHtml);
router.get('/generate-pdf/:year/:month', generatePdfRecap);
router.get('/monthly-trends', getMonthlyOrderTrends);
router.get('/status-distribution', getOrderStatusDistribution);

module.exports = router;
