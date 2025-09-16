const express = require("express");
const router = express.Router();
const direkturPemesananController = require("../controllers/direkturPemesananController"); 
const { authenticate, authorizeRole } = require("../Middleware/authMiddleware"); 

// Rute untuk mendapatkan semua pemesanan (Order List Direktur)
router.get("/all", authenticate, authorizeRole(['direktur']), direkturPemesananController.getAllPemesananDirektur);

// Rute Dashboard Direktur - Statistik & Rekap
router.get("/dashboard/pending-payments-count", authenticate, authorizeRole(['direktur']), direkturPemesananController.getPendingPaymentsCountDirektur);
router.get("/dashboard/monthly-orders-count", authenticate, authorizeRole(['direktur']), direkturPemesananController.getMonthlyOrdersCountDirektur);
router.get("/dashboard/total-users-count", authenticate, authorizeRole(['direktur']), direkturPemesananController.getTotalUsersCountDirektur);
router.get("/dashboard/recent-orders", authenticate, authorizeRole(['direktur']), direkturPemesananController.getRecentOrdersDirektur);
router.get("/dashboard/recap", authenticate, authorizeRole(['direktur']), direkturPemesananController.getDashboardRecapDirektur);
router.get("/dashboard/monthly-order-trends", authenticate, authorizeRole(['direktur']), direkturPemesananController.getMonthlyOrderTrendsDirektur);
router.get("/dashboard/order-status-distribution", authenticate, authorizeRole(['direktur']), direkturPemesananController.getOrderStatusDistributionDirektur);

// Rute Rekap Bulanan HTML (untuk dilihat di browser/Puppeteer)
router.get("/rekap-bulanan-html/:year/:month", authenticate, authorizeRole(['direktur']), direkturPemesananController.getRecapHtmlDirektur);

// Rute Generate PDF Rekap Bulanan
router.get("/generate-pdf/:year/:month", authenticate, authorizeRole(['direktur']), direkturPemesananController.generatePdfRecapDirektur);


module.exports = router;
