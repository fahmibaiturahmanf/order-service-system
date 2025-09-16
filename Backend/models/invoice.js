const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    pemesanan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pemesanan',
        required: true
    },

    namaPemesan: {
        type: String,
        required: true
    },
    emailPemesan: {
        type: String,
        required: true
    },

    detailJasa: [
        {
            namaJasa: { type: String, required: true },
            harga: { type: Number, required: true }
        }
    ],

    totalHargaInvoice: {
        type: Number,
        required: true
    },

    invoiceUrl: {
        type: String,
        required: true
    },

    nomorInvoice: {
        type: String,
        unique: true,
        required: true
    },

    jenisInvoice: { 
        type: String,
        enum: ['DP', 'Pelunasan', 'Full Payment'],
        required: true
    },

    tanggalInvoice: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
