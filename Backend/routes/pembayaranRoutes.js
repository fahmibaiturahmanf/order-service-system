const express = require("express");
const router = express.Router();
const pembayaranController = require("../controllers/pembayaranController"); 
const multer = require("multer");
const path = require("path");

// Debugging
if (!pembayaranController.createPembayaran) console.error("Error: `createPembayaran` tidak ditemukan di controller!");
if (!pembayaranController.getPembayaranByPemesanan) console.error("Error: `getPembayaranByPemesanan` tidak ditemukan di controller!");
if (!pembayaranController.konfirmasiPembayaran) console.error("Error: `konfirmasiPembayaran` tidak ditemukan di controller!");


// Konfigurasi Multer untuk menyimpan file upload (bukti pembayaran)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Silahkan upload file dengan format JPG, PNG, atau PDF saja"), false);
    }
};

const upload = multer({ storage, fileFilter });

// Route untuk menerima upload bukti pembayaran dan membuat catatan pembayaran baru
router.post("/upload", upload.single("bukti_pembayaran"), pembayaranController.createPembayaran); // Mengubah dari '/' menjadi '/upload' untuk kejelasan

// Route untuk mendapatkan informasi pembayaran berdasarkan ID Pemesanan
router.get("/:pemesanan_id", pembayaranController.getPembayaranByPemesanan);

// Route untuk mengkonfirmasi atau menolak pembayaran oleh admin
router.patch("/konfirmasi", pembayaranController.konfirmasiPembayaran);

module.exports = router;