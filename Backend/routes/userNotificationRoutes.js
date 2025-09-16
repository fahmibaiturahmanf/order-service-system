const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  createNotification
} = require('../controllers/userNotificationController');

// Ambil semua notifikasi user
router.get('/user/:userId', getUserNotifications);

// Tandai notifikasi sebagai sudah dibaca
router.patch('/:id/read', markAsRead);

// (Opsional) Tambah notifikasi manual (bisa dipakai buat testing)
router.post('/', createNotification);

module.exports = router;
