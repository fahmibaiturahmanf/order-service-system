const Jasa = require('../models/Jasa');

// GET semua jasa untuk user
const getAllJasaForUser = async (req, res) => {
  try {
    const jasaList = await Jasa.find().sort({ created_at: -1 });
    res.status(200).json(jasaList);
  } catch (error) {
    console.error('Gagal mengambil data jasa untuk user:', error.message);
    res.status(500).json({ message: 'Gagal mengambil data jasa' });
  }
};

module.exports = {
  getAllJasaForUser,
};
