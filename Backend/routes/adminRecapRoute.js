// Backend/routes/adminRecapRoute.js

const express = require('express');
const router = express.Router();
const adminRecapController = require('../controllers/adminRecapController'); // PASTIKAN PATH INI BENAR
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); // PASTIKAN PATH INI BENAR

// --- Rute-Rute Rekapitulasi untuk Admin/Direktur ---

// Rute untuk mendapatkan jumlah pembayaran tertunda
router.get('/pending-payments-count', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getPendingPaymentsCount);

// Rute untuk mendapatkan jumlah pesanan bulanan
router.get('/monthly-orders-count', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getMonthlyOrdersCount);

// Rute untuk mendapatkan total jumlah pengguna
router.get('/total-users-count', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getTotalUsersCount);

// Rute untuk mendapatkan daftar pesanan terbaru
router.get('/recent-orders', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getRecentOrders);

// Rute untuk mendapatkan rekapitulasi dashboard
router.get('/dashboard-recap', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getDashboardRecap);

// Rute untuk mendapatkan tren pesanan bulanan
router.get('/monthly-order-trends', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getMonthlyOrderTrends);

// Rute untuk mendapatkan distribusi status pesanan
router.get('/order-status-distribution', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getOrderStatusDistribution);

// Rute untuk mendapatkan HTML rekap bulanan (digunakan internal oleh Puppeteer untuk generate PDF, tapi juga bisa diakses langsung)
router.get('/rekap-bulanan/:year/:month', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.getRecapHtml);

// Rute untuk menghasilkan PDF rekap bulanan
router.get('/generate-pdf/:year/:month', authenticate, authorizeRole(['admin', 'direktur']), adminRecapController.generatePdfRecap);

router.get('/debug/cek-selesai-juni', async (req, res) => {
    try {
        const start = new Date(2025, 5, 1); // Juni = bulan ke-5 (0-based)
        const end = new Date(2025, 5, 30, 23, 59, 59);

        const selesaiOrders = await require('../models/Pemesanan').find({
            status_pemesanan: "Selesai",
            tanggal_kickoff: {
                $gte: start,
                $lte: end
            }
        });

        res.json({
            jumlah: selesaiOrders.length,
            data: selesaiOrders
        });
    } catch (err) {
        console.error("DEBUG ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;