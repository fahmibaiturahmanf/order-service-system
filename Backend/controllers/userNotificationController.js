const Notification = require('../models/notification');

// Ambil semua notifikasi user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifs = await Notification.find({ userId }).sort({ created_at: -1 });
    res.json(notifs);
  } catch (error) {
    console.error('Gagal ambil notifikasi:', error);
    res.status(500).json({ message: 'Gagal mengambil notifikasi' });
  }
};

// Tandai notifikasi sebagai dibaca
const markAsRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    await Notification.findByIdAndUpdate(notifId, { is_read: true });
    res.json({ message: 'Notifikasi ditandai sebagai dibaca' });
  } catch (error) {
    console.error('Gagal update notifikasi:', error);
    res.status(500).json({ message: 'Gagal update notifikasi' });
  }
};

// (Opsional) Tambah notifikasi manual dari frontend (jika perlu)
const createNotification = async (req, res) => {
  try {
    const { userId, isi_notifikasi, status_pemesanan } = req.body;
    const notif = await Notification.create({
      userId,
      isi_notifikasi,
      status_pemesanan
    });
    res.status(201).json(notif);
  } catch (error) {
    console.error('Gagal buat notifikasi:', error);
    res.status(500).json({ message: 'Gagal membuat notifikasi' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  createNotification
};
