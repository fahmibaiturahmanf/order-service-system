const Pembayaran = require("../models/Pembayaran");
const Pemesanan = require("../models/Pemesanan");
const User = require("../models/User");
const Validasi = require("../models/Validasi"); 
const mongoose = require("mongoose");
const fs = require('fs');

// Fungsi untuk memproses validasi yang dilakukan oleh admin (Valid/Invalid)
const processAdminValidation = async (req, res) => {
    console.log("--------------------------------------------------");
    console.log("Memulai proses validasi admin.");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request Body:", req.body); 
    console.log("Admin ID dari req.adminId:", req.adminId); 
    console.log("--------------------------------------------------");

    try {
        const { pembayaranId, statusValidasi } = req.body; 
        const adminId = req.adminId; // adminId ini berasal dari middleware authenticateAdmin

        if (!adminId) {
            console.error("Kesalahan Validasi: Admin ID tidak ditemukan di req. Autentikasi gagal.");
            return res.status(401).json({ message: "Admin ID tidak ditemukan. Autentikasi gagal." });
        }

        if (!pembayaranId) {
            console.error("Kesalahan Validasi: pembayaranId tidak ditemukan di body.");
            return res.status(400).json({ message: "ID Pembayaran wajib diisi." });
        }
        if (!mongoose.Types.ObjectId.isValid(pembayaranId)) {
            console.error(`Kesalahan Validasi: ID Pembayaran '${pembayaranId}' tidak valid.`);
            return res.status(400).json({ message: "ID Pembayaran tidak valid." });
        }
        if (!['Valid', 'Invalid'].includes(statusValidasi)) {
            console.error(`Kesalahan Validasi: Status validasi '${statusValidasi}' tidak valid. Harus 'Valid' atau 'Invalid'.`);
            return res.status(400).json({ message: "Status validasi tidak valid." });
        }

        const pembayaran = await Pembayaran.findById(pembayaranId);
        if (!pembayaran) {
            console.error(`Kesalahan Validasi: Pembayaran dengan ID '${pembayaranId}' tidak ditemukan.`);
            return res.status(404).json({ message: "Pembayaran tidak ditemukan." });
        }

        const pemesanan = await Pemesanan.findById(pembayaran.pemesanan_id);
        if (!pemesanan) {
            console.error(`Kesalahan Validasi: Pemesanan terkait dengan pembayaran ID '${pembayaranId}' tidak ditemukan.`);
            return res.status(404).json({ message: "Pemesanan terkait tidak ditemukan." });
        }

        if (pembayaran.status === 'Dikonfirmasi' || pembayaran.status === 'Ditolak') {
            return res.status(400).json({ message: `Pembayaran ini sudah ${pembayaran.status.toLowerCase()}. Tidak bisa divalidasi ulang.` });
        }

        let updatedStatusPemesanan = pemesanan.status_pemesanan;
        let updatedStatusPembayaranDetail = pemesanan.status_pembayaran_detail;
        let updatedSisaTagihan = pemesanan.sisa_tagihan;
        // `generatedInvoiceUrl` dihapus karena tidak lagi digenerate di sini.

        if (statusValidasi === 'Valid') {
            pembayaran.status = 'Dikonfirmasi';
            await pembayaran.save(); 

            if (pembayaran.tipe_pembayaran === "DP") {
                updatedStatusPembayaranDetail = "DP Terbayar";
                updatedSisaTagihan = pemesanan.harga_jasa - (pemesanan.harga_jasa * 0.5); 
                // POINT 1: Setelah DP divalidasi, status pesanan utama menjadi "Diproses"
                updatedStatusPemesanan = 'Diproses'; 
            } else if (pembayaran.tipe_pembayaran === "Pelunasan") {
                updatedStatusPembayaranDetail = "Lunas";
                updatedSisaTagihan = 0; 
                // Ketika pelunasan divalidasi, status utama tetap 'Diproses'
                // Status 'Selesai' akan diatur di `invoiceController` setelah invoice pelunasan dikirim.
                updatedStatusPemesanan = 'Diproses'; 
            }

            // HAPUS PANGGILAN generateInvoicePdfAndSave DI SINI.
            // Ini akan dipanggil secara terpisah dari frontend melalui tombol "Kirim Invoice".
        } else { // statusValidasi === 'Invalid'
            pembayaran.status = 'Ditolak';
            await pembayaran.save(); 

            if (pembayaran.bukti_pembayaran) {
                const filePath = path.join(__dirname, '../uploads', pembayaran.bukti_pembayaran);
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Gagal menghapus bukti pembayaran yang ditolak:", err);
                });
            }

            if (pembayaran.tipe_pembayaran === "Pelunasan") {
                updatedStatusPembayaranDetail = 'DP Terbayar'; 
                updatedSisaTagihan = pemesanan.harga_jasa * 0.5;
            } else { 
                updatedStatusPembayaranDetail = 'Belum Dibayar'; 
                updatedSisaTagihan = pemesanan.harga_jasa; 
            }
            updatedStatusPemesanan = "Menunggu Pembayaran"; 
        }

        pemesanan.status_pemesanan = updatedStatusPemesanan;
        pemesanan.status_pembayaran_detail = updatedStatusPembayaranDetail;
        pemesanan.sisa_tagihan = updatedSisaTagihan; 
        await pemesanan.save();

        let existingValidation = await Validasi.findOne({ pemesanan_id: pemesanan._id, pembayaran_id: pembayaran._id }); 
        if (existingValidation) {
            existingValidation.status_validasi = statusValidasi;
            existingValidation.admin_id = adminId;
            existingValidation.tanggal_validasi = Date.now();
            await existingValidation.save();
        } else {
            const newValidation = new Validasi({
                pemesanan_id: pemesanan._id,
                pembayaran_id: pembayaran._id, 
                admin_id: adminId,
                status_validasi: statusValidasi,
                tanggal_validasi: Date.now()
            });
            await newValidation.save();
        }

        console.log(`Validasi berhasil: Pemesanan ${pemesanan._id} diatur ke ${statusValidasi}.`);
        return res.status(200).json({
            message: `Pemesanan berhasil di ${statusValidasi === 'Valid' ? 'Validasi' : 'Ditolak'}!`,
            pemesanan: pemesanan, 
            pembayaran: pembayaran, 
            validasiStatus: statusValidasi,
            // `invoiceUrlGenerated` dihapus dari respons karena tidak lagi relevan di sini.
        });

    } catch (error) {
        console.error('!!! ERROR SAAT MELAKUKAN VALIDASI ADMIN:', error);
        return res.status(500).json({
            message: error.message || 'Terjadi kesalahan server yang tidak diketahui saat validasi admin.',
            detail: error 
        });
    }
};

// Fungsi untuk mengambil data invoice/pemesanan untuk ditampilkan di halaman admin
const getInvoiceData = async (req, res) => {
    const { pemesananId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pemesananId)) {
        return res.status(400).json({ message: "ID Pemesanan tidak valid" });
    }

    try {
        const pemesanan = await Pemesanan.findById(pemesananId)
            .populate({
                path: "user_id",
                select: "name email no_telepon alamat",
            })
            .lean();

        if (!pemesanan) {
            return res.status(404).json({ message: "Data pemesanan tidak ditemukan" });
        }

        const pembayaranTerbaru = await Pembayaran.findOne({ pemesanan_id: pemesananId })
            .sort({ tanggal_transaksi: -1 }) 
            .lean();

        const validasiData = await Validasi.findOne({ pemesanan_id: pemesananId })
            .lean();

        return res.status(200).json({
            pemesananId: pemesanan._id,
            pemesan: {
                nama: pemesanan.nama || pemesanan.user_id?.name || "Pengguna Tidak Terdaftar",
                email: pemesanan.email || pemesanan.user_id?.email || "Tidak Tersedia",
                no_telepon: pemesanan.no_telepon || pemesanan.user_id?.phone || "Tidak Tersedia",
                alamat: pemesanan.alamat || pemesanan.user_id?.alamat || "Tidak Tersedia",
            },
            jenisJasa: pemesanan.jenis_jasa,
            tanggalPemesanan: pemesanan.created_at,
            tanggalKickoff: pemesanan.tanggal_kickoff,
            
            buktiPembayaran: pembayaranTerbaru?.bukti_pembayaran || null,
            totalHarga: pemesanan.harga_jasa,
            statusPembayaran: pembayaranTerbaru?.status || "Belum Ada Pembayaran", 
            latestPaymentId: pembayaranTerbaru?._id || null, 
            latestPaymentType: pembayaranTerbaru?.tipe_pembayaran || null, 

            statusValidasi: validasiData?.status_validasi || "Pending", 
            
            status_pemesanan_utama: pemesanan.status_pemesanan,
            status_pembayaran_detail_pemesanan: pemesanan.status_pembayaran_detail,
            sisa_tagihan_pemesanan: pemesanan.sisa_tagihan,
            invoiceUrlDP: pemesanan.invoiceUrlDP || null, 
            invoiceUrlPelunasan: pemesanan.invoiceUrlPelunasan || null, 
            invoiceUrl: pemesanan.invoiceUrl || null, 
        });
    } catch (error) {
        console.error("[ERROR] getInvoiceData:", error);
        return res.status(500).json({
            message: error.message || "Terjadi kesalahan saat mengambil data invoice",
            error: error.message,
        });
    }
};

module.exports = {
    validasiPemesanan: processAdminValidation,
    getInvoiceData,
};
