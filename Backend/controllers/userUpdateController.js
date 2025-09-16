const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateProfileUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      username,
      oldPassword,
      newPassword,
      oldPhone,
      newPhone,
      name,
      alamat,
      newEmail,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    // ✅ Validasi password lama
    if (oldPassword && !(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ message: 'Password lama tidak cocok.' });
    }

    // ✅ Validasi no telepon lama
    if (oldPhone && oldPhone !== user.phone) {
      return res.status(400).json({ message: 'Nomor telepon lama tidak cocok.' });
    }

    // ✅ Ubah data yang dikirim (jika ada)
    if (username) user.username = username;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
    if (newPhone) user.phone = newPhone;
    if (name) user.name = name;
    if (alamat) user.alamat = alamat;

    // ✅ Ubah email jika dikirim, pastikan tidak dipakai oleh orang lain
    if (newEmail) {
      const emailUsed = await User.findOne({ email: newEmail });
      if (emailUsed && emailUsed._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh akun lain.' });
      }
      user.email = newEmail;
    }

    user.updated_at = new Date();

    await user.save();
    res.json({ message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    console.error('Gagal update profil:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  updateProfileUser,
};
