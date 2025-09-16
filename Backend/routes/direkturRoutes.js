const express = require('express');
const router = express.Router();
const direkturController = require('../controllers/direkturController');
const pemesananController = require('../controllers/pemesananController');

// REVISI: Impor middleware baru
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

// Rute Direktur
router.post('/login', direkturController.loginDirektur);

// Gunakan 'authenticate' untuk verifikasi token, lalu 'authorizeRole(['direktur'])' untuk memastikan peran
router.get('/profile', authenticate, authorizeRole(['direktur']), direkturController.getDirekturProfile);
router.get('/dashboard', authenticate, authorizeRole(['direktur']), direkturController.getDirekturDashboardData);

// Untuk rute pemesanan direktur, gunakan authenticateDirektur
router.get('/pemesanan', authenticate, authorizeRole(['direktur']), pemesananController.getAllPemesanan);

module.exports = router;
