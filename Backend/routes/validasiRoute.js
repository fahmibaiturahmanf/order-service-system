const express = require('express');
const router = express.Router();
const validasiController = require('../controllers/validasiController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); 

router.post('/', authenticate, authorizeRole(['admin']), validasiController.validasiPemesanan);
router.get('/:pemesananId', authenticate, authorizeRole(['admin']), validasiController.getInvoiceData);

module.exports = router;
