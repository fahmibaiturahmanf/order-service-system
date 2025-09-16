const Pemesanan = require("../models/Pemesanan");
const Pembayaran = require("../models/Pembayaran");
const Validasi = require("../models/Validasi");
const Notification = require('../models/notification');
const User = require("../models/User");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Fungsi ini untuk mengambil **semua data invoice** yang diperlukan untuk tampilan halaman admin.
// Ini menggabungkan informasi dari beberapa model (Pemesanan, Pembayaran, Validasi).
const getAllInvoicesDataForAdminPage = async (req, res) => {
    try {
        // Cari semua dokumen Pemesanan.
        const pemesanans = await Pemesanan.find()
            // Isi detail user (nama, email, no_telepon, alamat) dari 'user_id' yang terkait.
            .populate({ path: "user_id", select: "name email no_telepon alamat" })
            // Urutkan dari yang terbaru.
            .sort({ created_at: -1 })
            // Ubah dokumen Mongoose ke objek JavaScript biasa untuk performa.
            .lean();

        // Proses setiap pemesanan untuk menambahkan detail pembayaran dan validasi terbaru.
        // `Promise.all` digunakan karena setiap pemesanan memerlukan query database terpisah.
        const invoicesWithDetails = await Promise.all(
            pemesanans.map(async (pemesanan) => {
                // Cari pembayaran terbaru untuk pemesanan ini.
                const pembayaranTerbaru = await Pembayaran.findOne({ pemesanan_id: pemesanan._id }).sort({ tanggal: -1 }).lean();
                // Cari catatan validasi terbaru untuk pemesanan ini.
                const validasiTerbaru = await Validasi.findOne({ pemesanan_id: pemesanan._id }).sort({ created_at: -1 }).lean();
                // Ambil semua pembayaran terkait pemesanan ini.
                const allPayments = await Pembayaran.find({ pemesanan_id: pemesanan._id }).sort({ tanggal: 1 }).lean();

                // Kembalikan objek yang berisi semua detail yang relevan untuk invoice.
                return {
                    pemesananId: pemesanan._id,
                    // Informasi pemesan, ambil dari user_id jika ada, atau dari pemesanan itu sendiri.
                    pemesan: {
                        nama: pemesanan.user_id?.name || pemesanan.nama || 'N/A',
                        email: pemesanan.user_id?.email || pemesanan.email || 'N/A',
                        no_telepon: pemesanan.user_id?.no_telepon || pemesanan.no_telepon || 'N/A',
                        alamat: pemesanan.user_id?.alamat || pemesanan.alamat || 'N/A',
                    },
                    jenisJasa: pemesanan.jenis_jasa || 'N/A',
                    tanggalPemesanan: pemesanan.created_at,
                    tanggalKickoff: pemesanan.tanggal_kickoff,
                    buktiPembayaran: pembayaranTerbaru?.bukti_pembayaran || null, // Bukti pembayaran terbaru.
                    totalHarga: pemesanan.harga_jasa,
                    statusPembayaran: pemesanan.status_pembayaran_detail || "Belum Dibayar",
                    latestPaymentId: pembayaranTerbaru?._id || null,
                    latestPaymentType: pembayaranTerbaru?.tipe_pembayaran || null,
                    statusValidasiPembayaranDokumen: pembayaranTerbaru?.status || "Belum Divalidasi", // Status validasi dokumen pembayaran itu sendiri.
                    statusValidasi: validasiTerbaru?.status_validasi || "Belum Validasi", // Status validasi keseluruhan pemesanan.
                    status_pemesanan_utama: pemesanan.status_pemesanan,
                    status_pembayaran_detail_pemesanan: pemesanan.status_pembayaran_detail,
                    sisa_tagihan_pemesanan: pemesanan.sisa_tagihan,
                    invoiceUrlDP: pemesanan.invoiceUrlDP || null, // URL invoice DP (jika ada).
                    invoiceUrlPelunasan: pemesanan.invoiceUrlPelunasan || null, // URL invoice pelunasan (jika ada).
                    invoiceUrl: pemesanan.invoiceUrl || null, // URL invoice umum (jika ada).
                    alasan_pembatalan: pemesanan.alasan_pembatalan || '', // Alasan pembatalan (jika ada)
                    // Daftar semua pembayaran yang terkait dengan pemesanan ini.
                    allPayments: allPayments.map((pay) => ({
                        _id: pay._id,
                        tipe_pembayaran: pay.tipe_pembayaran,
                        status: pay.status,
                        bukti_pembayaran: pay.bukti_pembayaran,
                        tanggal: pay.tanggal,
                        nomor_referensi: pay.nomor_referensi || 'N/A'
                    })),
                };
            })
        );

        // Kirim data invoices dengan detail lengkap.
        res.status(200).json({ invoices: invoicesWithDetails });
    } catch (error) {
        // Tangani error jika terjadi masalah saat mengambil data.
        console.error("Error getting all invoices data for admin page:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data invoice.", error: error.message });
    }
};

// Fungsi ini untuk **menangani validasi pembayaran** oleh admin (mengonfirmasi atau menolak).
// Ini akan memperbarui status pembayaran dan status pemesanan.
const handlePaymentValidation = async (req, res) => {
    try {
        // Ambil ID pembayaran dan status validasi (Valid/Tolak) dari body request.
        const { pembayaranId, statusValidasi } = req.body;

        // Validasi input.
        if (!pembayaranId || !statusValidasi) {
            return res.status(400).json({ message: 'Pembayaran ID dan Status Validasi diperlukan.' });
        }

        // Cari dokumen pembayaran yang akan divalidasi.
        const pembayaran = await Pembayaran.findById(pembayaranId);
        if (!pembayaran) {
            return res.status(404).json({ message: 'Pembayaran tidak ditemukan.' });
        }

        // Perbarui status pembayaran berdasarkan aksi validasi.
        pembayaran.status = statusValidasi === 'Valid' ? 'Dikonfirmasi' : 'Ditolak';
        await pembayaran.save();

        // Cari pemesanan yang terkait dengan pembayaran ini.
        const pemesanan = await Pemesanan.findById(pembayaran.pemesanan_id);
        if (!pemesanan) {
            return res.status(404).json({ message: 'Pesanan terkait pembayaran tidak ditemukan.' });
        }

        // Logika update status pemesanan dan sisa tagihan berdasarkan hasil validasi
        // dan tipe pembayaran (DP/Pelunasan).
        if (statusValidasi === 'Valid') {
            if (pembayaran.tipe_pembayaran === 'DP') {
                pemesanan.status_pembayaran_detail = 'DP Terbayar';
                pemesanan.sisa_tagihan = pemesanan.harga_jasa * 0.5; // Sisa 50% setelah DP.
            } else if (pembayaran.tipe_pembayaran === 'Pelunasan') {
                pemesanan.status_pembayaran_detail = 'Lunas';
                pemesanan.sisa_tagihan = 0; // Tidak ada sisa tagihan.
                pemesanan.status_pemesanan = 'Selesai'; // Ubah status pemesanan utama menjadi "Selesai".
                pemesanan.tanggal_selesai = new Date(); // Catat tanggal selesai.
            }
        } else { // Jika statusValidasi adalah 'Tolak'
            if (pembayaran.tipe_pembayaran === 'DP') {
                pemesanan.status_pembayaran_detail = 'Menunggu Pembayaran'; // Kembali ke status menunggu pembayaran DP.
            } else if (pembayaran.tipe_pembayaran === 'Pelunasan') {
                pemesanan.status_pembayaran_detail = 'DP Terbayar'; // Kembali ke status DP terbayar (jika pelunasan ditolak).
            }
        }

        // Simpan perubahan pada dokumen pemesanan.
        await pemesanan.save();

        // Buat atau perbarui catatan validasi di koleksi Validasi.
        await Validasi.findOneAndUpdate(
            { pembayaran_id: pembayaranId }, // Cari berdasarkan ID pembayaran.
            {
                pemesanan_id: pemesanan._id,
                pembayaran_id: pembayaranId,
                status_validasi: statusValidasi, // Simpan status validasi (Valid/Tolak).
                tanggal_validasi: new Date()
            },
            { upsert: true, new: true } // Buat baru jika tidak ada, kembalikan dokumen yang diperbarui.
        );

        // Kirim respons sukses.
        res.status(200).json({ message: `Pembayaran berhasil divalidasi sebagai ${statusValidasi}.` });
    } catch (error) {
        // Tangani error jika terjadi masalah.
        console.error("Error during payment validation:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memvalidasi pembayaran.", error: error.message });
    }
};

// Fungsi ini untuk **merender halaman HTML invoice**.
// Ini adalah template yang akan digunakan untuk tampilan invoice atau untuk diubah jadi PDF.
const getInvoiceHtml = async (req, res) => {
    // Ambil jalur absolut ke gambar logo untuk invoice.
    const logoPath = path.join(__dirname, "../public/images/logoinvoice.png");
    console.log("🎯 Token diterima di server:", req.headers.authorization);

    // Baca file gambar logo dan konversi ke format Base64. Ini agar gambar bisa langsung
    // di-embed ke dalam HTML.
    const logoData = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

    // Ambil ID pemesanan dan tipe invoice (dp/pelunasan) dari parameter URL.
    const { pemesananId, type } = req.params;
    try {
        // Cari dokumen pemesanan berdasarkan ID.
        const pemesanan = await Pemesanan.findById(pemesananId)
            // Isi detail user (nama, email, phone, alamat) jika ada.
            .populate({ path: 'user_id', select: 'name email phone alamat' })
            .lean();
        // Jika pemesanan tidak ditemukan, kirim error 404.
        if (!pemesanan) return res.status(404).send('Pemesanan tidak ditemukan.');

        // Cek kondisi: jika tipe DP tapi DP belum terkonfirmasi, tolak.
        if (type === 'dp' && pemesanan.status_pembayaran_detail !== 'DP Terbayar') {
            return res.status(400).send('Pembayaran DP belum terkonfirmasi.');
        }
        // Cek kondisi: jika tipe pelunasan tapi belum lunas, tolak.
        if (type === 'pelunasan' && pemesanan.status_pembayaran_detail !== 'Lunas') {
            return res.status(400).send('Pembayaran Pelunasan belum terkonfirmasi.');
        }

        // Siapkan data untuk ditampilkan di invoice:
        const tanggal = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }); // Tanggal hari ini.
        const nomor = `INV-${pemesanan._id.toString().substring(0, 8)}-${type.toUpperCase()}`; // Nomor invoice unik.
        const jenis_invoice = type === 'dp' ? 'Uang Muka (DP)' : 'Pelunasan'; // Teks jenis invoice.
        // Data user, ambil dari `user_id` jika ada, kalau tidak 'N/A'.
        const nama = pemesanan.user_id?.name || 'N/A';
        const email = pemesanan.user_id?.email || 'N/A';
        const no_telepon = pemesanan.user_id?.phone || 'N/A';
        const alamat_user = pemesanan.user_id?.alamat || 'N/A';
        const total = pemesanan.harga_jasa || 0;
        const sisa_tagihan = pemesanan.sisa_tagihan || 0;

        // Data layanan yang dipesan (dalam format array untuk template).
        const pesanan = [{
            nama_jasa: pemesanan.jenis_jasa || 'Jasa Tidak Diketahui',
            harga: pemesanan.harga_jasa || 0
        }];

        // Render template EJS 'invoiceTemplate' dengan semua data yang disiapkan.
        res.render('invoiceTemplate', {
            nama, email, no_telepon, alamat_user,
            tanggal, nomor, jenis_invoice,
            sisa_tagihan, total, pesanan,
            logoBase64 // Kirim data logo Base64 ke template.
        });

    } catch (err) {
        // Tangani error saat merender invoice HTML.
        console.error('Error saat merender invoice HTML:', err);
        res.status(500).send('Terjadi kesalahan saat merender invoice HTML.');
    }
};


// Fungsi ini untuk **men-generate file PDF invoice** untuk admin.
// Ini menggunakan Puppeteer untuk mengubah HTML invoice menjadi PDF dan menyimpannya.
const generateInvoiceForAdmin = async (req, res) => {
    // Ambil jalur absolut ke gambar logo untuk invoice.
    const logoPath = path.join(__dirname, "../public/images/logoinvoice.png");

    // Baca file gambar logo dan konversi ke format Base64.
    const logoData = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

    // Ambil ID pemesanan dari parameter URL dan tipe invoice (dp/pelunasan) dari body request.
    const { pemesananId } = req.params;
    const { type } = req.body;
    let browser; // Deklarasi variabel browser di luar try block untuk penanganan error.

    try {
        // Cari dokumen pemesanan.
        const pemesanan = await Pemesanan.findById(pemesananId);
        if (!pemesanan) {
            return res.status(404).json({ message: 'Pemesanan tidak ditemukan.' });
        }

        // Cek validasi status pembayaran sebelum generate invoice.
        if (type === 'dp' && pemesanan.status_pembayaran_detail !== 'DP Terbayar') {
            return res.status(400).json({ message: 'Pembayaran DP belum terkonfirmasi.' });
        }
        if (type === 'pelunasan' && pemesanan.status_pembayaran_detail !== 'Lunas') {
            return res.status(400).json({ message: 'Pembayaran Pelunasan belum terkonfirmasi.' });
        }

        // Luncurkan browser headless (latar belakang).
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        // Buka halaman baru di browser.
        const page = await browser.newPage();

        // Tentukan port aplikasi dan URL halaman HTML invoice yang akan di-*render*.
        const port = process.env.PORT || 5000;
        const urlToRender = `http://localhost:${port}/api/admin-invoices/invoice-html/${pemesananId}/${type}`;
        // Ambil token autentikasi dari header request.
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        // Set header autentikasi jika token ada, agar Puppeteer bisa mengakses halaman yang dilindungi.
        if (token) {
            await page.setExtraHTTPHeaders({
                'Authorization': `Bearer ${token}`
            });
        }

        // Kunjungi URL HTML invoice dan tunggu hingga jaringan stabil.
        console.log("🔑 Token yg dipake Puppeteer:", token ? token.slice(0,30) + "..." : "NONE");
        const responsePuppeteer = await page.goto(urlToRender, { 
         waitUntil: 'domcontentloaded', 
         timeout: 60000 
         });
         await page.waitForSelector("#invoice-container", { timeout: 10000 });

        // Cek apakah request ke URL HTML berhasil.
        if (!responsePuppeteer.ok()) {
            const errorText = await responsePuppeteer.text();
            await browser.close();
            return res.status(responsePuppeteer.status()).json({
                message: `Gagal membuat PDF invoice: ${errorText}`
            });
        }

        // Buat PDF dari halaman yang sedang terbuka.
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });

        // Tutup browser setelah selesai.
        await browser.close();

        // Tentukan jalur penyimpanan file invoice PDF.
        const invoiceSubPath = path.join("uploads", "invoices");
        const fullInvoiceDirPath = path.resolve("uploads", "invoices");

        // Buat direktori jika belum ada.
        if (!fs.existsSync(fullInvoiceDirPath)) {
            fs.mkdirSync(fullInvoiceDirPath, { recursive: true });
        }

        // Buat nama file unik untuk invoice.
        const fileName = `invoice-${pemesananId}-${type}.pdf`;
        const filePath = path.join(fullInvoiceDirPath, fileName);
        // Tulis buffer PDF ke file.
        fs.writeFileSync(filePath, pdfBuffer);

        // Buat URL yang bisa diakses untuk invoice yang disimpan.
        const invoiceUrl = `/${invoiceSubPath.replace(/\\/g, "/")}/${fileName}`;

        // Simpan URL invoice ke dokumen pemesanan yang sesuai (DP atau Pelunasan).
        if (type === 'dp') {
            pemesanan.invoiceUrlDP = invoiceUrl;
        } else if (type === 'pelunasan') {
            pemesanan.invoiceUrlPelunasan = invoiceUrl;
        }
        // Simpan perubahan pada dokumen pemesanan.
        await pemesanan.save();

        // Kirim respons sukses dengan URL invoice yang baru dibuat.
        res.status(200).json({ message: 'Invoice berhasil dibuat dan URL disimpan.', url: invoiceUrl });
    } catch (error) {
        // Tangani error jika terjadi masalah saat generate PDF.
        console.error("Error generating invoice PDF for admin:", error);
        // Pastikan browser ditutup jika ada error.
        if (browser) await browser.close();
        res.status(500).json({ message: "Terjadi kesalahan saat membuat invoice.", error: error.message });
    }
};

// Fungsi ini untuk **menerima atau menolak permintaan pembatalan pesanan**.
// Admin dapat menyetujui pembatalan atau menolaknya dan mengembalikan status pesanan.
const handlePembatalanPemesanan = async (req, res) => {
    try {
        const { id } = req.params;
        const { aksi } = req.body;

        const pemesanan = await Pemesanan.findById(id);
        if (!pemesanan) {
            return res.status(404).json({ message: 'Pemesanan tidak ditemukan.' });
        }

        if (pemesanan.status_pemesanan !== 'Menunggu Persetujuan Pembatalan') {
            return res.status(400).json({ message: 'Pesanan ini tidak sedang menunggu persetujuan pembatalan.' });
        }

        // Panggil model notifikasi
        const Notification = require('../models/notification');

        if (aksi === 'setuju') {
            pemesanan.status_pemesanan = 'Dibatalkan';

            // ➕ Tambahkan notifikasi SETUJU
            await Notification.create({
                userId: pemesanan.user_id,
                isi_notifikasi: 'Permintaan pembatalan Anda telah disetujui oleh admin.',
                status_pemesanan: 'Dibatalkan',
                is_read: false
            });

        } else if (aksi === 'tolak') {
            pemesanan.status_pemesanan = 'Menunggu Pembayaran';

            // ➕ Tambahkan notifikasi TOLAK
            await Notification.create({
                userId: pemesanan.user_id,
                isi_notifikasi: 'Permintaan pembatalan Anda ditolak oleh admin.',
                status_pemesanan: 'Menunggu Pembayaran',
                is_read: false
            });

        } else {
            return res.status(400).json({ message: 'Aksi tidak valid. Gunakan "setuju" atau "tolak".' });
        }

        await pemesanan.save();
        await Notification.create({
        userId: pemesanan.user_id,
        isi_notifikasi: `Pesanan Anda dengan jasa "${pemesanan.jenis_jasa}" telah ${aksi === 'setuju' ? 'dibatalkan' : 'tidak jadi dibatalkan oleh admin'}.`,
        status_pemesanan: pemesanan.status_pemesanan
        });

        res.status(200).json({ message: `Pembatalan telah di${aksi === 'setuju' ? 'setujui' : 'tolak'}.` });
    } catch (error) {
        console.error("Gagal memproses pembatalan:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat memproses pembatalan pesanan.", error: error.message });
    }
};

module.exports = {
    getAllInvoicesDataForAdminPage,
    handlePaymentValidation,
    getInvoiceHtml,
    generateInvoiceForAdmin,
    handlePembatalanPemesanan,
};