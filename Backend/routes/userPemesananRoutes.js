// Backend/routes/userPemesananRoutes.js
const express = require('express');
const router = express.Router();
const userPemesananController = require('../controllers/userPemesananController'); // PASTIKAN PATH INI BENAR

// KOREKSI: Gunakan authenticate dan authorizeRole dari authMiddleware
// PASTIKAN PATH FOLDER MIDDLEWARE ANDA BENAR (Middleware atau middlewares?)
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); 

// Route untuk mendapatkan semua pesanan pengguna
// Endpoint: /api/user-pemesanan/my-orders
router.get('/my-orders', authenticate, authorizeRole(['user']), userPemesananController.getAllUserPemesanan);

// Route untuk membuat pesanan oleh pengguna
// Endpoint: /api/user-pemesanan/create-order
router.post('/create-order', authenticate, authorizeRole(['user']), userPemesananController.createUserPemesanan);

//Batalkan pesanan oleh user
router.patch('/:id/ajukan-batal', authenticate, userPemesananController.ajukanPembatalanUser);

module.exports = router;
