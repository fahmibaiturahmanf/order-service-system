const User = require('../models/User'); 

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 }); 
    return res.status(200).json({ users }); 
  } catch (error) {
    console.error('Error saat mendapatkan semua pengguna:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan saat mendapatkan daftar pengguna.', error: error.message });
  }
};