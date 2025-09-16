const Pemesanan = require("../models/Pemesanan");
const Jasa = require("../models/Jasa");
const Pembayaran = require("../models/Pembayaran");
const Validasi = require("../models/Validasi");
const User = require('../models/User'); 
const puppeteer = require('puppeteer');

// Fungsi untuk membuat pemesanan baru
const createPemesanan = async (req, res) => {
    try {
        console.log("Request pemesanan diterima:", req.body);
        console.log("Data user dari token:", req.user);

        const {
            nama,
            email,
            no_telepon,
            alamat,
            tanggal_kickoff,
            jenis_jasa,
            harga_jasa,
        } = req.body;

        if (!nama || !email || !no_telepon || !alamat || !tanggal_kickoff || !jenis_jasa) {
            console.error("Error: Data pemesanan tidak lengkap!");
            return res.status(400).json({ message: "Semua field wajib diisi." });
        }

        const foundJasa = await Jasa.findOne({ nama_jasa: jenis_jasa });
        if (!foundJasa) {
            console.error("Error: Jasa tidak ditemukan!", jenis_jasa);
            return res.status(400).json({ message: "Jenis jasa tidak valid." });
        }

        const finalHargaJasa = harga_jasa || foundJasa.harga_jasa;
        let userId = null;

        if (req.user && req.user.id) {
            userId = req.user.id || req.user._id;
            console.log("User ID ditemukan dari token:", userId);
        } else {
            console.log("Pengguna tidak terautentikasi saat membuat pemesanan.");
        }

        const newPemesanan = new Pemesanan({
            nama,
            email,
            no_telepon,
            alamat,
            tanggal_kickoff,
            jenis_jasa: foundJasa.nama_jasa,
            jasa_id: foundJasa._id,
            harga_jasa: finalHargaJasa,
            user_id: userId,
        });

        const savedPemesanan = await newPemesanan.save();

        console.log("Pemesanan berhasil dibuat:", savedPemesanan);
        return res.status(201).json({ message: "Pemesanan berhasil dibuat!", pemesanan: savedPemesanan });
    } catch (error) {
        console.error("Error saat membuat pemesanan:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat membuat pemesanan.", error: error.message });
    }
};

// Fungsi untuk mendapatkan semua pemesanan (untuk admin)
const getAllPemesanan = async (req, res) => {
    try {
        const pemesanans = await Pemesanan.find()
            .populate({
                path: 'user_id',
                select: 'name email no_telepon'
            })
            .sort({ _id: -1 })
            .lean();

        const pemesanansWithDetails = await Promise.all(
            pemesanans.map(async (pemesanan) => {
                const pembayaran = await Pembayaran.findOne({ pemesanan_id: pemesanan._id });
                const validasi = await Validasi.findOne({ pemesanan_id: pemesanan._id });

                return {
                    ...pemesanan,
                    buktiPembayaran: pembayaran ? pembayaran.bukti_pembayaran : null,
                    statusPembayaran: pembayaran ? pembayaran.status : "Menunggu Pembayaran",
                    statusValidasi: validasi ? validasi.status_validasi : "Belum Validasi",
                };
            })
        );

        return res.status(200).json({ pemesanans: pemesanansWithDetails });
    } catch (error) {
        console.error("Error saat mendapatkan semua pemesanan:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan pemesanan.", error: error.message });
    }
};

// Fungsi untuk menghapus pemesanan berdasarkan ID (untuk admin)
const deletePemesanan = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Pemesanan.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Pemesanan tidak ditemukan." });
        }
        return res.status(200).json({ message: "Pemesanan berhasil dihapus!" });
    } catch (error) {
        console.error("Error saat menghapus pemesanan:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat menghapus pemesanan.", error: error.message });
    }
};

// Fungsi untuk mendapatkan semua pemesanan milik user
const getPemesananByUser = async (req, res) => {
    try {
        console.log('req.user di getPemesananByUser:', req.user);
        const userId = req.user.id || req.user._id;

        if (!userId) {
            return res.status(400).json({ message: 'ID pengguna tidak ditemukan dalam token.' });
        }

        const pemesanans = await Pemesanan.find({ user_id: userId })
            .populate({
                path: 'user_id',
                select: 'name email'
            })
            .sort({ created_at: -1 });

        return res.status(200).json({ pemesanans });
    } catch (error) {
        console.error('Error saat mendapatkan pesanan pengguna:', error);
        return res.status(500).json({
            message: 'Terjadi kesalahan saat mendapatkan pesanan.',
            error: error.message,
        });
    }
};

// FUNGSI BARU UNTUK DASHBOARD DAN REKAPITULASI
const getPendingPaymentsCount = async (req, res) => {
    try {
        const count = await Pemesanan.countDocuments({
            status_pembayaran_detail: "Menunggu Validasi"
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting pending payments count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pembayaran tertunda." });
    }
};

const getMonthlyOrdersCount = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const count = await Pemesanan.countDocuments({
            created_at: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting monthly orders count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pesanan bulan ini." });
    }
};

const getTotalUsersCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting total users count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pengguna." });
    }
};

const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Pemesanan.find()
            .sort({ created_at: -1 })
            .limit(5)
            .select('nama jenis_jasa tanggal_kickoff status_pemesanan created_at')
            .lean();

        res.status(200).json({ recentOrders });
    } catch (error) {
        console.error("Error getting recent orders:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil pesanan terbaru." });
    }
};

const getDashboardRecap = async (req, res) => {
    try {
        const totalOrders = await Pemesanan.countDocuments();
        const completedOrders = await Pemesanan.countDocuments({ status_pemesanan: "Selesai" });

        res.status(200).json({
            totalOrders,
            completedOrders
        });
    } catch (error) {
        console.error("Error saat mendapatkan data rekap dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan data rekap.", error: error.message });
    }
};

const getRecapHtml = async (req, res) => {
    const { year, month } = req.params;

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Hari terakhir di bulan itu

        const pemesanans = await Pemesanan.find({
            tanggal_kickoff: {
                $gte: startDate,
                $lte: endDate
            },
        }).sort({ tanggal_kickoff: 1 }).lean();

        let rekapData = {};
        let totalOmset = 0;

        pemesanans.forEach(pemesanan => {
            // Pastikan tanggal_kickoff adalah Date object sebelum memanggil toISOString
            const kickoffDate = new Date(pemesanan.tanggal_kickoff);
            const dateKey = kickoffDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

            if (!rekapData[dateKey]) {
                rekapData[dateKey] = {
                    date: kickoffDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), // Format tanggal lebih ramah manusia
                    dailyOrders: [],
                    dailyTotal: 0
                };
            }
            const transactionAmount = pemesanan.harga_jasa; // Atau total yang Anda hitung
            rekapData[dateKey].dailyOrders.push({
                nama: pemesanan.nama,
                jenis_jasa: pemesanan.jenis_jasa,
                harga_jasa: pemesanan.harga_jasa,
                status_pemesanan: pemesanan.status_pemesanan,
                status_pembayaran_detail: pemesanan.status_pembayaran_detail,
                total: transactionAmount
            });
            rekapData[dateKey].dailyTotal += transactionAmount;
            totalOmset += transactionAmount;
        });

        const rekapArray = Object.values(rekapData);

        res.render('rekap', {
            rekapArray: rekapArray,
            totalOmset: totalOmset,
            month: new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' }),
            year: year
        });

    } catch (err) {
        console.error('Error saat membuat rekap HTML:', err);
        // Penting: Kirim status 500 dan pesan error agar Puppeteer bisa menangkapnya
        res.status(500).send('Terjadi kesalahan saat membuat rekap HTML: ' + err.message);
    }
};

const generatePdfRecap = async (req, res) => {
    const { year, month } = req.params;

    try {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (!token) {
            console.error("Token autentikasi tidak ditemukan saat mencoba generate PDF.");
            // Mengembalikan 401 jika token tidak ada, karena rute ini dilindungi.
            return res.status(401).json({ message: 'Tidak terautentikasi. Token tidak ditemukan.' });
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Penting untuk lingkungan deployment
        });
        const page = await browser.newPage();
        const urlToRender = `http://localhost:${process.env.PORT || 5000}/api/pemesanan/rekap-bulanan/${year}/${month}`;

        await page.setExtraHTTPHeaders({
            'Authorization': `Bearer ${token}`
        });

        // Pergi ke URL dan tunggu sampai jaringan idle (semua request selesai, artinya halaman sudah dimuat sepenuhnya).
        await page.goto(urlToRender, { waitUntil: 'networkidle0' });

        const pageContent = await page.content();
        // Mencari string yang mengindikasikan error autentikasi atau umum dari respons backend Anda.
        if (pageContent.includes("Akses ditolak") || pageContent.includes("Unauthorized") || pageContent.includes("Forbidden") || pageContent.includes("Error")) {
            console.error("Puppeteer gagal mendapatkan konten rekap HTML. Kemungkinan masalah autentikasi atau error server di rute HTML.");
            console.error("Konten Halaman Error (sebagian):", pageContent.substring(0, 500)); // Log 500 karakter pertama dari konten halaman error
            await browser.close();
            // Mengembalikan 403 jika Puppeteer tidak dapat mengakses halaman rekap.
            return res.status(403).json({
                message: "Gagal membuat PDF: Akses ditolak. Membutuhkan peran admin atau direktur." // Pesan error yang lebih spesifik untuk frontend
            });
        }

        // Jika halaman berhasil dimuat (tanpa error autentikasi), buat PDF.
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true, // Untuk mencetak warna latar belakang dan gambar
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        await browser.close(); // Tutup browser Puppeteer setelah selesai.

        // Mengatur header respons agar browser mengunduh file PDF.
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rekap-pemesanan-${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '-')}.pdf"`);
        res.send(pdfBuffer); // Mengirim buffer PDF sebagai respons.

    } catch (err) {
        console.error('Error generating PDF (controller):', err);
        // Mengembalikan 500 untuk error internal server lainnya.
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF: ' + err.message });
    }
};

const getMonthlyOrderTrends = async (req, res) => {
    try {
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const trends = await Pemesanan.aggregate([
            {
                $match: {
                    created_at: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const formattedTrends = trends.map(item => ({
            name: `${item._id.month}/${item._id.year % 100}`,
            uv: item.count
        }));

        res.status(200).json(formattedTrends);
    } catch (error) {
        console.error("Error getting monthly order trends:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil tren pesanan bulanan.", error: error.message });
    }
};

const getOrderStatusDistribution = async (req, res) => {
    try {
        const distribution = await Pemesanan.aggregate([
            {
                $group: {
                    _id: "$status_pemesanan",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: "$count",
                    _id: 0
                }
            }
        ]);

        res.status(200).json(distribution);
    } catch (error) {
        console.error("Error getting order status distribution:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil distribusi status pesanan.", error: error.message });
    }
};



module.exports = {
    createPemesanan,
    getAllPemesanan,
    deletePemesanan,
    getPemesananByUser,
    getPendingPaymentsCount,
    getMonthlyOrdersCount,
    getTotalUsersCount,
    getRecentOrders,
    getDashboardRecap,
    getRecapHtml,
    generatePdfRecap,
    getMonthlyOrderTrends,
    getOrderStatusDistribution
};