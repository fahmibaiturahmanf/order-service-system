const Pemesanan = require('../models/Pemesanan');
const Jasa = require('../models/Jasa'); 
const User = require('../models/User'); 
const Notification = require('../models/notification'); 

// ======================================
// Fungsi untuk membuat pemesanan oleh user
// ======================================
const createUserPemesanan = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(401).json({ message: 'Tidak terautentikasi. ID pengguna tidak ditemukan.' });
        }

        const {
            nama,
            email,
            no_telepon,
            alamat,
            tanggal_kickoff,
            jenis_jasa,
        } = req.body;

        if (!nama || !email || !no_telepon || !alamat || !tanggal_kickoff || !jenis_jasa) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        const foundJasa = await Jasa.findOne({ nama_jasa: jenis_jasa });
        if (!foundJasa) {
            return res.status(400).json({ message: 'Jenis jasa tidak valid.' });
        }

        const hargaJasaDariDB = foundJasa.harga_jasa; 

        if (typeof hargaJasaDariDB !== 'number' || isNaN(hargaJasaDariDB) || hargaJasaDariDB <= 0) {
            return res.status(400).json({ message: 'Harga jasa tidak valid. Harap hubungi administrator.' });
        }

        // Hitung 50% sebagai sisa tagihan awal
        const sisaTagihanAwal = hargaJasaDariDB * 0.5; 

        const newPemesanan = new Pemesanan({
            user_id: userId,
            nama,
            email,
            no_telepon,
            alamat,
            tanggal_kickoff,
            jenis_jasa: foundJasa.nama_jasa,
            jasa_id: foundJasa._id,
            harga_jasa: hargaJasaDariDB,
            status_pemesanan: 'Menunggu Pembayaran',
            status_pembayaran_detail: 'Belum Dibayar',
            sisa_tagihan: sisaTagihanAwal,
            history_pembayaran: [],
        });

        const savedPemesanan = await newPemesanan.save();

        // Buat notifikasi setelah pemesanan
        await Notification.create({
            userId: userId,
            isi_notifikasi: "Pemesanan sudah terkirim dan dimohon untuk menghubungi kami melalui formulir meeting yang sudah anda isi.",
            status_pemesanan: 'Menunggu Meeting'
        });

        res.status(201).json({
            message: 'Pemesanan berhasil dibuat!',
            pemesanan: savedPemesanan 
        });

    } catch (error) {
        console.error('Error saat membuat pemesanan oleh user:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Validasi pemesanan gagal.', errors: messages });
        }
        res.status(500).json({ message: 'Gagal membuat pesanan.', error: error.message });
    }
};

// ======================================
// Fungsi untuk mengambil semua pemesanan milik user
// ======================================
const getAllUserPemesanan = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(401).json({ message: 'Tidak terautentikasi. ID pengguna tidak ditemukan.' });
        }

        const pemesanans = await Pemesanan.find({ user_id: userId })
            .populate({ path: 'user_id', select: 'name email' })
            .sort({ created_at: -1 });

        res.status(200).json({
            message: 'Daftar pesanan pengguna berhasil diambil.',
            pemesanans
        });

    } catch (error) {
        console.error('Error saat mengambil daftar pesanan pengguna:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar pesanan.', error: error.message });
    }
};

// ======================================
// Fungsi agar user bisa mengajukan pembatalan pemesanan (jika belum bayar)
// ======================================
const ajukanPembatalanUser = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const pemesananId = req.params.id;
    const { alasan } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Tidak terautentikasi.' });
    }

    if (!alasan || alasan.trim() === '') {
      return res.status(400).json({ message: 'Alasan pembatalan tidak boleh kosong.' });
    }

    const pemesanan = await Pemesanan.findOne({ _id: pemesananId, user_id: userId });

    if (!pemesanan) {
      return res.status(404).json({ message: 'Pemesanan tidak ditemukan.' });
    }

    if (pemesanan.status_pembayaran_detail !== 'Belum Dibayar') {
      return res.status(400).json({ message: 'Pembatalan hanya dapat diajukan sebelum melakukan pembayaran DP.' });
    }

    if (pemesanan.status_pemesanan === 'Menunggu Persetujuan Pembatalan') {
      return res.status(400).json({ message: 'Permintaan pembatalan sudah diajukan sebelumnya.' });
    }

    pemesanan.status_pemesanan = 'Menunggu Persetujuan Pembatalan';
    pemesanan.alasan_pembatalan = alasan; 
    await pemesanan.save();

    await Notification.create({
      userId: userId,
      isi_notifikasi: "Permintaan pembatalan pemesanan telah diajukan. Menunggu persetujuan admin.",
      status_pemesanan: 'Menunggu Persetujuan Pembatalan'
    });

    res.status(200).json({ message: 'Permintaan pembatalan berhasil diajukan.' });
  } catch (error) {
    console.error('Gagal mengajukan pembatalan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengajukan pembatalan.', error: error.message });
  }
};

module.exports = {
  createUserPemesanan,
  getAllUserPemesanan,
  ajukanPembatalanUser, 
};
