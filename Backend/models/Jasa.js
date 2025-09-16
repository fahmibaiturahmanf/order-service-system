const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jasaSchema = new Schema({
  nama_jasa: { type: String, required: true, unique: true },
  deskripsi_jasa: { type: String },
  alat_dan_bahan: { type: String },
  durasi_jasa: { type: String },
  harga_jasa: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Jasa', jasaSchema);