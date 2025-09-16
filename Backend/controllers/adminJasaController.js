const Jasa = require('../models/Jasa');

// Ambil semua jasa
const getAllJasa = async (req, res) => {
  try {
    const jasa = await Jasa.find().sort({ created_at: -1 });
    res.json(jasa);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data jasa' });
  }
};

// Tambah jasa baru
const createJasa = async (req, res) => {
  try {
    const newJasa = new Jasa(req.body);
    await newJasa.save();
    res.status(201).json(newJasa);
  } catch (err) {
    res.status(400).json({ message: 'Gagal menambahkan jasa', error: err.message });
  }
};

// Update jasa
const updateJasa = async (req, res) => {
  try {
    const updatedJasa = await Jasa.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updated_at: Date.now() },
      { new: true }
    );
    res.json(updatedJasa);
  } catch (err) {
    res.status(400).json({ message: 'Gagal mengubah jasa' });
  }
};

// Hapus jasa
const deleteJasa = async (req, res) => {
  try {
    await Jasa.findByIdAndDelete(req.params.id);
    res.json({ message: 'Jasa berhasil dihapus' });
  } catch (err) {
    res.status(400).json({ message: 'Gagal menghapus jasa' });
  }
};

module.exports = {
  getAllJasa,
  createJasa,
  updateJasa,
  deleteJasa,
};
