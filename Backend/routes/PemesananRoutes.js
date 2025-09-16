const express = require("express");
const router = express.Router();
const pemesananController = require("../controllers/pemesananController");
// KOREKSI: Import authenticate dan authorizeRole dari authMiddleware
const { authenticate, authorizeRole } = require("../Middleware/authMiddleware"); // Pastikan path ini benar


// === VALIDASI KEBERADAAN CONTROLLER FUNCTIONS ===
// Tetap biarkan ini untuk debugging jika ada controller yang hilang
if (!pemesananController.createPemesanan) console.error("Error: `createPemesanan` tidak ditemukan!");
if (!pemesananController.getAllPemesanan) console.error("Error: `getAllPemesanan` tidak ditemukan!");
if (!pemesananController.deletePemesanan) console.error("Error: `deletePemesanan` tidak ditemukan!");
if (!pemesananController.getPemesananByUser) console.error("Error: `getPemesananByUser` tidak ditemukan!");
if (!pemesananController.getPendingPaymentsCount) console.error("Error: `getPendingPaymentsCount` tidak ditemukan!");
if (!pemesananController.getMonthlyOrdersCount) console.error("Error: `getMonthlyOrdersCount` tidak ditemukan!");
if (!pemesananController.getTotalUsersCount) console.error("Error: `getTotalUsersCount` tidak ditemukan!");
if (!pemesananController.getRecentOrders) console.error("Error: `getRecentOrders` tidak ditemukan!");
if (!pemesananController.getDashboardRecap) console.error("Error: `getDashboardRecap` tidak ditemukan!");
if (!pemesananController.getRecapHtml) console.error("Error: `getRecapHtml` tidak ditemukan!");
if (!pemesananController.generatePdfRecap) console.error("Error: `generatePdfRecap` tidak ditemukan!");
if (!pemesananController.getMonthlyOrderTrends) console.error("Error: `getMonthlyOrderTrends` tidak ditemukan!");
if (!pemesananController.getOrderStatusDistribution) console.error("Error: `getOrderStatusDistribution` tidak ditemukan!");


// === Rute Umum Pemesanan (mungkin diakses user atau admin/direktur) ===
// KOREKSI: Gunakan authenticate dan authorizeRole
router.post("/", authenticate, authorizeRole(['user']), pemesananController.createPemesanan); // Buat pemesanan baru (user harus login)
router.get("/user", authenticate, authorizeRole(['user']), pemesananController.getPemesananByUser); // Ambil semua pemesanan milik user


// === Rute Admin untuk Pemesanan (membutuhkan admin role saja) ===
// KOREKSI: Gunakan authenticate dan authorizeRole(['admin'])
router.get("/admin", authenticate, authorizeRole(['admin']), pemesananController.getAllPemesanan); // Ambil semua pemesanan (untuk admin)
router.delete("/admin/:id", authenticate, authorizeRole(['admin']), pemesananController.deletePemesanan); // Hapus pemesanan berdasarkan ID (untuk admin)

// === Rute Direktur untuk Pemesanan (membutuhkan direktur role saja) ===
// KOREKSI: Gunakan authenticate dan authorizeRole(['direktur'])
router.get("/direktur", authenticate, authorizeRole(['direktur']), pemesananController.getAllPemesanan); // Ambil semua pemesanan (untuk direktur)


// === Rute Khusus untuk Dashboard Admin Home (bisa diakses admin atau direktur) ===
// KOREKSI: Semua rute ini menggunakan authenticate dan authorizeRole(['admin', 'direktur'])
router.get("/dashboard/pending-payments-count", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getPendingPaymentsCount);
router.get("/dashboard/monthly-orders-count", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getMonthlyOrdersCount);
router.get("/dashboard/total-users-count", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getTotalUsersCount);
router.get("/dashboard/recent-orders", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getRecentOrders);
router.get("/dashboard/monthly-order-trends", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getMonthlyOrderTrends);
router.get("/dashboard/order-status-distribution", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getOrderStatusDistribution);


// === Rute Khusus untuk Halaman Rekapitulasi (bisa diakses admin atau direktur) ===
// KOREKSI: Gunakan authenticate dan authorizeRole(['admin', 'direktur'])
router.get("/recap-dashboard", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getDashboardRecap);
router.get("/rekap-bulanan/:year/:month", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.getRecapHtml);
router.get("/generate-pdf/:year/:month", authenticate, authorizeRole(['admin', 'direktur']), pemesananController.generatePdfRecap);


module.exports = router;
