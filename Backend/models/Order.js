const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  nama: String,
  email: String,
  no_telepon: String,
  alamat: String,
  tanggal_kickoff: Date,
  jenis_jasa: String,
  jasa_id: mongoose.Schema.Types.ObjectId,
  harga_jasa: Number,
  status_pemesanan: String,
  user_id: mongoose.Schema.Types.ObjectId,
  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model('Order', orderSchema);
