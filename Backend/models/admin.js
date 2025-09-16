const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  username: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  alamat: { type: String, trim: true },
  token_login: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);