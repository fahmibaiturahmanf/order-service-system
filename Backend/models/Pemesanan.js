const mongoose = require("mongoose");
const Notification = require('./notification');
const Schema = mongoose.Schema;

const pemesananSchema = new Schema({
    nama: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    no_telepon: { type: String, required: true, trim: true },
    alamat: { type: String, required: true, trim: true },
    tanggal_kickoff: { type: Date, required: true },
    jenis_jasa: { type: String, required: true, trim: true },
    jasa_id: { type: Schema.Types.ObjectId, ref: "Jasa" },
    harga_jasa: { type: Number, required: true, min: 1 },

    status_pemesanan: {
        type: String,
        enum: [
            "Menunggu Pembayaran",
            "Diproses",
            "Selesai",
            "Dibatalkan",
            "Menunggu Persetujuan Pembatalan"
        ],
        default: "Menunggu Pembayaran"
    },

    alasan_pembatalan: {
      type: String,
      trim: true,
      default: '',
    },

    status_pembayaran_detail: {
        type: String,
        enum: ["Belum Dibayar", "DP Terbayar", "Lunas", "Menunggu Validasi", "Dibatalkan"],
        default: "Belum Dibayar"
    },

    sisa_tagihan: { type: Number, default: function() { return this.harga_jasa; } },

    statusValidasi: {
        type: String,
        enum: ["Valid", "Invalid", "Belum Validasi"],
        default: "Belum Validasi"
    },

    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    invoiceUrlDP: { type: String },
    invoiceUrlPelunasan: { type: String },
    invoiceUrl: { type: String },

    tanggal_selesai: { type: Date } // ✅ field tambahan untuk rekap bulan
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

pemesananSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

pemesananSchema.post('save', async function (doc, next) {
  try {
    // Cek kalau status_pemesanan berubah ke "Dibatalkan"
    if (this.isModified('status_pemesanan') && this.status_pemesanan === 'Dibatalkan') {
      await Notification.create({
        userId: this.user_id,
        isi_notifikasi: 'Pesanan Anda telah dibatalkan oleh admin.',
        status_pemesanan: 'Dibatalkan',
        is_read: false
      });
    }
  } catch (err) {
    console.error('❌ Gagal membuat notifikasi pembatalan:', err);
  }
  next();
});

module.exports = mongoose.model("Pemesanan", pemesananSchema);
