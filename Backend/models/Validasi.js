// models/Validasi.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validasiSchema = new Schema({
    admin_id: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    pembayaran_id: { 
        type: Schema.Types.ObjectId,
        ref: 'Pembayaran',  // Harus sesuai dengan nama model
        required: true
    },
    pemesanan_id: {
        type: Schema.Types.ObjectId,
        ref: 'Pemesanan',
        required: true
    },
    tanggal_validasi: {
        type: Date,
        default: Date.now
    },
    status_validasi: {
        type: String,
        enum: ['Pending', 'Valid', 'Invalid'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('Validasi', validasiSchema);