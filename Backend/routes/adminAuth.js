const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Pastikan ini path yang benar
const pemesananController = require('../controllers/pemesananController');
const validasiController = require('../controllers/validasiController');
const invoiceController = require('../controllers/invoiceController');

// REVISI: Impor middleware baru
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

// Rute yang tidak memerlukan otentikasi (login, register)
router.post('/login', adminController.loginAdmin);
router.post('/register', adminController.createAdmin);

// Rute yang memerlukan otentikasi admin
// Gunakan 'authenticate' untuk verifikasi token, lalu 'authorizeRole(['admin'])' untuk memastikan peran
router.get('/admins', authenticate, authorizeRole(['admin']), adminController.getAllAdmin);
router.post('/logout', authenticate, authorizeRole(['admin']), adminController.logoutAdmin); // Logout juga perlu otentikasi untuk sesi yang valid
router.get('/profile', authenticate, authorizeRole(['admin']), adminController.getAdminProfile);

// Rute Dashboard
router.get('/pemesanan/dashboard/pending-payments-count', authenticate, authorizeRole(['admin']), pemesananController.getPendingPaymentsCount);
router.get('/pemesanan/dashboard/monthly-orders-count', authenticate, authorizeRole(['admin']), pemesananController.getMonthlyOrdersCount);
router.get('/pemesanan/dashboard/total-users-count', authenticate, authorizeRole(['admin']), pemesananController.getTotalUsersCount);
router.get('/pemesanan/dashboard/recent-orders', authenticate, authorizeRole(['admin']), pemesananController.getRecentOrders);
router.get('/pemesanan/dashboard/monthly-order-trends', authenticate, authorizeRole(['admin']), pemesananController.getMonthlyOrderTrends);
router.get('/pemesanan/dashboard/order-status-distribution', authenticate, authorizeRole(['admin']), pemesananController.getOrderStatusDistribution);

// Rute OrderList
router.get('/orders', authenticate, authorizeRole(['admin']), pemesananController.getAllPemesanan);

// Rute InvoicePage (Validasi Pembayaran)
router.get('/validasi/:pemesananId', authenticate, authorizeRole(['admin']), validasiController.getInvoiceData);
router.post('/validasi', authenticate, authorizeRole(['admin']), validasiController.validasiPemesanan); 

// Rute Generate Invoice
router.post('/invoice/generate-invoice/:pemesananId', authenticate, authorizeRole(['admin']), invoiceController.generateInvoice);

module.exports = router;
