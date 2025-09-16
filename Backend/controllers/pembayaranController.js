const Pembayaran = require("../models/Pembayaran");
const Pemesanan = require("../models/Pemesanan");
const Notification = require('../models/notification'); 
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

// ============================================================
// Fungsi: createPembayaran
// Deskripsi: Membuat atau memperbarui pembayaran berdasarkan tipe (DP atau Pelunasan),
// lalu menyimpan bukti bayar dan mengupdate status pemesanan serta notifikasi.
// ============================================================
const createPembayaran = async (req, res) => {
    try {
        const { pemesanan_id, tipe_pembayaran, nomor_referensi } = req.body;
        const bukti_pembayaran_filename = req.file ? req.file.filename : null;

        // Validasi dasar
        if (!mongoose.Types.ObjectId.isValid(pemesanan_id)) {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ message: "ID pemesanan tidak valid." });
        }

        if (!nomor_referensi || nomor_referensi.trim() === "") {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ message: "Nomor referensi wajib diisi." });
        }

        const pemesanan = await Pemesanan.findById(pemesanan_id);
        if (!pemesanan) {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(404).json({ message: "Pemesanan tidak ditemukan." });
        }

        if (pemesanan.status_pembayaran_detail === 'Lunas') {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ success: false, message: "Pemesanan ini sudah lunas." });
        }

        let jumlahBayarSaatIni;
        if (tipe_pembayaran === 'DP') {
            jumlahBayarSaatIni = pemesanan.harga_jasa * 0.5;
            if (['DP Terbayar', 'Menunggu Validasi'].includes(pemesanan.status_pembayaran_detail)) {
                if (req.file && bukti_pembayaran_filename) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
                }
                return res.status(400).json({ success: false, message: "DP sudah dibayar atau sedang divalidasi." });
            }
        } else if (tipe_pembayaran === 'Pelunasan') {
            jumlahBayarSaatIni = pemesanan.sisa_tagihan;
            if (jumlahBayarSaatIni <= 0 || pemesanan.status_pembayaran_detail !== 'DP Terbayar') {
                if (req.file && bukti_pembayaran_filename) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
                }
                return res.status(400).json({ success: false, message: "Pelunasan tidak valid." });
            }
        } else {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ success: false, message: "Tipe pembayaran tidak valid." });
        }

        // Simpan pembayaran
        let existingPayment = await Pembayaran.findOne({ pemesanan_id, tipe_pembayaran });
        if (existingPayment) {
            if (existingPayment.bukti_pembayaran && existingPayment.bukti_pembayaran !== bukti_pembayaran_filename) {
                fs.unlink(path.join(__dirname, '../uploads', existingPayment.bukti_pembayaran), () => {});
            }
            existingPayment.bukti_pembayaran = bukti_pembayaran_filename;
            existingPayment.nomor_referensi = nomor_referensi;
            existingPayment.tanggal_transaksi = Date.now();
            existingPayment.jumlah_pembayaran = jumlahBayarSaatIni;
            existingPayment.status = 'Menunggu Validasi';
            await existingPayment.save();
        } else {
            const newPayment = new Pembayaran({
                pemesanan_id,
                jumlah_pembayaran: jumlahBayarSaatIni,
                tanggal_transaksi: Date.now(),
                metode_pembayaran: 'Transfer Bank',
                bukti_pembayaran: bukti_pembayaran_filename,
                tipe_pembayaran,
                nomor_referensi,
                status: 'Menunggu Validasi'
            });
            existingPayment = await newPayment.save();
        }

        pemesanan.status_pembayaran_detail = 'Menunggu Validasi';
        await pemesanan.save();

        await Notification.create({
            userId: pemesanan.user_id,
            isi_notifikasi: "Pembayaran sedang divalidasi oleh admin.",
            status_pemesanan: pemesanan.status_pemesanan
        });

        res.status(201).json({
            message: "Pembayaran berhasil diupload dan menunggu validasi.",
            pembayaran: existingPayment
        });

    } catch (error) {
        console.error("Error saat membuat pembayaran:", error);
        if (req.file && req.file.filename) {
            fs.unlink(path.join(__dirname, '../uploads', req.file.filename), () => {});
        }
        res.status(500).json({
            message: "Terjadi kesalahan saat membuat pembayaran.",
            error: error.message
        });
    }
};

// ============================================================
// Fungsi: getPembayaranByPemesanan
// Deskripsi: Mengambil seluruh data pembayaran berdasarkan ID pemesanan
// ============================================================
const getPembayaranByPemesanan = async (req, res) => {
    try {
        const { pemesanan_id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pemesanan_id)) {
            return res.status(400).json({ message: "ID pemesanan tidak valid." });
        }

        const pembayaran = await Pembayaran.find({ pemesanan_id }).sort({ tanggal_transaksi: -1 });
        if (!pembayaran || pembayaran.length === 0) {
            return res.status(404).json({ message: "Tidak ada riwayat pembayaran untuk pemesanan ini." });
        }

        res.status(200).json({
            message: "Riwayat pembayaran ditemukan.",
            data: pembayaran
        });

    } catch (error) {
        console.error("Error saat mengambil pembayaran:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data pembayaran.",
            error: error.message
        });
    }
};

// ============================================================
// Fungsi: konfirmasiPembayaran
// Deskripsi: Admin memverifikasi status pembayaran (Diterima/Ditolak),
// dan menyesuaikan status pemesanan serta mengirim notifikasi ke user.
// ============================================================
const konfirmasiPembayaran = async (req, res) => {
    try {
        const { pembayaranId, statusKonfirmasi } = req.body;
        if (!mongoose.Types.ObjectId.isValid(pembayaranId)) {
            return res.status(400).json({ message: "ID pembayaran tidak valid." });
        }

        const pembayaran = await Pembayaran.findById(pembayaranId);
        if (!pembayaran) return res.status(404).json({ message: "Pembayaran tidak ditemukan." });

        const pemesanan = await Pemesanan.findById(pembayaran.pemesanan_id);
        if (!pemesanan) return res.status(404).json({ message: "Pemesanan tidak ditemukan." });

        // Cegah konfirmasi ulang
        if (pembayaran.status === 'Dikonfirmasi' || pembayaran.status === 'Ditolak') {
            return res.status(400).json({ message: `Pembayaran ini sudah ${pembayaran.status.toLowerCase()}.` });
        }

        // ========================
        // KONFIRMASI DITERIMA
        // ========================
        if (statusKonfirmasi === 'Diterima') {
            pembayaran.status = 'Dikonfirmasi';

            if (pembayaran.tipe_pembayaran === 'DP') {
                if (['Belum Dibayar', 'Menunggu Validasi'].includes(pemesanan.status_pembayaran_detail)) {
                    pemesanan.status_pembayaran_detail = 'DP Terbayar';
                    pemesanan.sisa_tagihan = pemesanan.harga_jasa - pembayaran.jumlah_pembayaran;
                }
            } else if (pembayaran.tipe_pembayaran === 'Pelunasan') {
                if (['DP Terbayar', 'Menunggu Validasi'].includes(pemesanan.status_pembayaran_detail)) {
                    pemesanan.status_pembayaran_detail = 'Lunas';
                    pemesanan.sisa_tagihan = 0;
                }
            }

            pemesanan.statusValidasi = 'Valid';

            // 🔔 Notifikasi sesuai tipe pembayaran
            if (pembayaran.tipe_pembayaran === 'DP') {
                await Notification.create({
                    userId: pemesanan.user_id,
                    isi_notifikasi: "Pembayaran DP telah dikonfirmasi. Silakan lanjutkan ke pembayaran pelunasan jika sudah siap.",
                    status_pemesanan: pemesanan.status_pemesanan
                });
            } else if (pembayaran.tipe_pembayaran === 'Pelunasan') {
                await Notification.create({
                    userId: pemesanan.user_id,
                    isi_notifikasi: "Pesanan sudah selesai. Invoice pelunasan telah dikirim. Silakan cek halaman profil Anda.",
                    status_pemesanan: pemesanan.status_pemesanan
                });
            }

        // ========================
        // KONFIRMASI DITOLAK
        // ========================
        } else if (statusKonfirmasi === 'Ditolak') {
            pembayaran.status = 'Ditolak';
            pemesanan.statusValidasi = 'Invalid';

            // Hapus bukti pembayaran
            if (pembayaran.bukti_pembayaran) {
                const filePath = path.join(__dirname, '../uploads', pembayaran.bukti_pembayaran);
                fs.unlink(filePath, () => {});
            }

            // Kembalikan status pemesanan sesuai tahap sebelumnya
            if (pembayaran.tipe_pembayaran === 'DP') {
                pemesanan.status_pembayaran_detail = 'Belum Dibayar';
                pemesanan.sisa_tagihan = pemesanan.harga_jasa;
            } else if (pembayaran.tipe_pembayaran === 'Pelunasan') {
                pemesanan.status_pembayaran_detail = 'DP Terbayar';
                pemesanan.sisa_tagihan = pemesanan.harga_jasa * 0.5;
            }

        } else {
            return res.status(400).json({ success: false, message: "Status konfirmasi tidak valid." });
        }

        await pembayaran.save();
        await pemesanan.save();

        res.status(200).json({
            success: true,
            message: `Pembayaran ${pembayaran.tipe_pembayaran} berhasil ${statusKonfirmasi}.`,
            pembayaran,
            pemesanan
        });

    } catch (error) {
        console.error("Error saat konfirmasi pembayaran:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat konfirmasi.",
            error: error.message
        });
    }
};

module.exports = {
    createPembayaran,
    getPembayaranByPemesanan,
    konfirmasiPembayaran
};
