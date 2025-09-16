const Jasa = require('../models/Jasa');

// Controller untuk menambahkan jenis jasa baru ke database
exports.createJasa = async (req, res) => {
  try {
    // Ambil data jasa dari body request
    const { nama_jasa, deskripsi_jasa, alat_dan_bahan, durasi_jasa, harga_jasa } = req.body;

    // Buat instance baru dari model Jasa
    const newJasa = new Jasa({
      nama_jasa,
      deskripsi_jasa,
      alat_dan_bahan,
      durasi_jasa,
      harga_jasa,
    });

    // Simpan data jasa ke database MongoDB
    const savedJasa = await newJasa.save();

    // Kirim respons berhasil dengan data jasa yang baru disimpan
    res.status(201).json({ message: 'Jenis jasa berhasil ditambahkan!', jasa: savedJasa });
  } catch (error) {
    // Jika terjadi error, kirim pesan kesalahan
    console.error('Gagal menambahkan jenis jasa:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan jenis jasa.', error: error.message });
  }
};

// Controller untuk mengambil semua data jenis jasa dari database
exports.getAllJasa = async (req, res) => {
  try {
    // Ambil semua data jasa dari collection Jasa
    const jasa = await Jasa.find();

    // Kirim data jasa dalam bentuk array
    res.status(200).json(jasa);
  } catch (error) {
    // Jika terjadi error, kirim pesan kesalahan
    console.error('Gagal mendapatkan semua jenis jasa:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mendapatkan jenis jasa.', error: error.message });
  }
};
