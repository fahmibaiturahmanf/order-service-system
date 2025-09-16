const express = require('express');
const router = express.Router();
const validasiController = require('../controllers/validasiController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); 

const validasiRoute = require('./validasiRoute'); // Asumsi validasiRoute adalah router terpisah

router.use('/validasi', authenticate, authorizeRole(['admin']), validasiRoute);

router.get(
    '/invoice/:pemesananId',
    authenticate,
    authorizeRole(['admin']),
    validasiController.getInvoiceData
);

module.exports = router;
