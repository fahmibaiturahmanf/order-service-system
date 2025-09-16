const Pemesanan = require('../models/Pemesanan');
const Pembayaran = require('../models/Pembayaran');
const Validasi = require('../models/Validasi');

const getAllOrdersDirektur = async (req, res) => {
  try {
    const pemesanans = await Pemesanan.find()
      .populate({
        path: 'user_id',
        select: 'name email no_telepon'
      })
      .sort({ _id: -1 })
      .lean();

    const pemesanansWithDetails = await Promise.all(
      pemesanans.map(async (pemesanan) => {
        const pembayaran = await Pembayaran.findOne({ pemesanan_id: pemesanan._id });
        const validasi = await Validasi.findOne({ pemesanan_id: pemesanan._id });

        return {
          ...pemesanan,
          buktiPembayaran: pembayaran ? pembayaran.bukti_pembayaran : null,
          status_pembayaran_detail: pembayaran ? pembayaran.status : "Menunggu Pembayaran",
          status_validasi: validasi ? validasi.status_validasi : "Belum Validasi",
        };
      })
    );

    return res.status(200).json({ pemesanans: pemesanansWithDetails });
  } catch (error) {
    console.error("Error direktur saat mengambil semua pemesanan:", error);
    return res.status(500).json({ message: "Gagal mengambil data pemesanan untuk direktur." });
  }
};

module.exports = {
  getAllOrdersDirektur
};
