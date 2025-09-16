const express = require('express');
const router = express.Router();
const direkturRecapController = require('../controllers/direkturRecapController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

router.get('/pending-payments-count', authenticate, authorizeRole(['direktur']), direkturRecapController.getPendingPaymentsCount);
router.get('/monthly-orders-count', authenticate, authorizeRole(['direktur']), direkturRecapController.getMonthlyOrdersCount);
router.get('/total-users-count', authenticate, authorizeRole(['direktur']), direkturRecapController.getTotalUsersCount);
router.get('/recent-orders', authenticate, authorizeRole(['direktur']), direkturRecapController.getRecentOrders);
router.get('/dashboard-recap', authenticate, authorizeRole(['direktur']), direkturRecapController.getDashboardRecap);
router.get('/monthly-trends', authenticate, authorizeRole(['direktur']), direkturRecapController.getMonthlyOrderTrends);
router.get('/order-status-distribution', authenticate, authorizeRole(['direktur']), direkturRecapController.getOrderStatusDistribution);

router.get('/rekap-bulanan/:year/:month', authenticate, authorizeRole(['direktur']), direkturRecapController.getRecapHtml);
router.get('/generate-pdf/:year/:month', authenticate, authorizeRole(['direktur']), direkturRecapController.generatePdfRecap);

module.exports = router;
