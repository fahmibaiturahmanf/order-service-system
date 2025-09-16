const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pembayaranSchema = new Schema({
  pemesanan_id: { type: Schema.Types.ObjectId, ref: "Pemesanan", required: true },
  jumlah_pembayaran: { type: Number, required: true, min: 1 },
  tipe_pembayaran: {
    type: String,
    enum: ["DP", "Pelunasan"],
    required: true
  },
  bukti_pembayaran: { type: String },

  nomor_referensi: { type: String, required: true, trim: true },

  status: {
    type: String,
    enum: ["Menunggu Validasi", "Dikonfirmasi", "Ditolak"],
    default: "Menunggu Validasi"
  },
  tanggal_transaksi: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Update otomatis updated_at
pembayaranSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Setelah pembayaran dikonfirmasi, kirim notifikasi otomatis
pembayaranSchema.post('save', async function (doc) {
  try {
    if (doc.status === 'Dikonfirmasi') {
      const Pemesanan = require('./Pemesanan');
      const Notification = require('./notification');

      const pemesanan = await Pemesanan.findById(doc.pemesanan_id);

      if (pemesanan && pemesanan.user_id) {
        const jenisPembayaran = doc.tipe_pembayaran === 'DP' ? 'Uang Muka (DP)' : 'Pelunasan';

        await Notification.create({
          userId: pemesanan.user_id,
          isi_notifikasi: `Pesanan anda telah divalidasi (${jenisPembayaran}). Anda dapat melihat invoice di halaman Profile.`,
          status_pemesanan: 'Divalidasi',
          is_read: false,
          created_at: new Date()
        });

        console.log(`Notifikasi ${jenisPembayaran} berhasil dikirim ke user.`);
      }
    }
  } catch (err) {
    console.error('Gagal membuat notifikasi otomatis setelah validasi pembayaran:', err);
  }
});

module.exports = mongoose.model("Pembayaran", pembayaranSchema);
