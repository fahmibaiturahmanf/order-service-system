const express = require('express');
const router = express.Router();
const adminInvoiceController = require('../controllers/adminInvoiceController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

// Rute untuk mendapatkan semua data invoice yang digabungkan untuk halaman admin
router.get('/all-invoices-data', authenticate, authorizeRole(['admin', 'direktur']), adminInvoiceController.getAllInvoicesDataForAdminPage);

// Rute untuk melakukan validasi pembayaran
router.post('/validate-payment', authenticate, authorizeRole(['admin', 'direktur']), adminInvoiceController.handlePaymentValidation);

// Rute BARU: Untuk Puppeteer merender HTML invoice (dilindungi oleh autentikasi)
// Endpoint: GET /api/admin-invoices/invoice-html/:pemesananId/:type
router.get('/invoice-html/:pemesananId/:type', authenticate, authorizeRole(['admin', 'direktur']), adminInvoiceController.getInvoiceHtml);

// Rute untuk menghasilkan PDF invoice (yang akan memanggil /invoice-html secara internal oleh Puppeteer)
router.post('/generate-invoice/:pemesananId', authenticate, authorizeRole(['admin', 'direktur']), adminInvoiceController.generateInvoiceForAdmin);

//Pengajuan pembatalan
router.patch('/pembatalan/:id', authenticate, authorizeRole(['admin']), adminInvoiceController.handlePembatalanPemesanan);
router.post('/pembatalan/:id', authenticate, authorizeRole(['admin']), adminInvoiceController.handlePembatalanPemesanan);

module.exports = router;
