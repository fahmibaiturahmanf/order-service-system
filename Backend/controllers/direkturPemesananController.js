const Pemesanan = require("../models/Pemesanan");
const Jasa = require("../models/Jasa"); 
const Pembayaran = require("../models/Pembayaran"); 
const Validasi = require("../models/Validasi"); 
const User = require('../models/User'); 
const puppeteer = require('puppeteer'); 

// Fungsi untuk mendapatkan semua pemesanan (untuk Direktur)
const getAllPemesananDirektur = async (req, res) => {
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
                    status_pembayaran_detail: pemesanan.status_pembayaran_detail, 
                    sisa_tagihan: pemesanan.sisa_tagihan, 
                    invoiceUrlDP: pemesanan.invoiceUrlDP, 
                    invoiceUrlPelunasan: pemesanan.invoiceUrlPelunasan, 
                    invoiceUrl: pemesanan.invoiceUrl, 
                };
            })
        );

        return res.status(200).json({ pemesanans: pemesanansWithDetails });
    } catch (error) {
        console.error("direkturPemesananController: Error saat mendapatkan semua pemesanan (Direktur):", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan pemesanan.", error: error.message });
    }
};

// Fungsi untuk mendapatkan jumlah pembayaran yang tertunda validasi (Dashboard Direktur)
const getPendingPaymentsCountDirektur = async (req, res) => {
    try {
        const count = await Pemesanan.countDocuments({
            status_pembayaran_detail: "Menunggu Validasi"
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error("direkturPemesananController: Error getting pending payments count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pembayaran tertunda." });
    }
};

// Fungsi untuk mendapatkan jumlah pesanan bulanan (Dashboard Direktur)
const getMonthlyOrdersCountDirektur = async (req, res) => {
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
        console.error("direkturPemesananController: Error getting monthly orders count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pesanan bulan ini." });
    }
};

// Fungsi untuk mendapatkan total jumlah pengguna (Dashboard Direktur)
const getTotalUsersCountDirektur = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("direkturPemesananController: Error getting total users count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pengguna." });
    }
};

// Fungsi untuk mendapatkan pesanan terbaru (Dashboard Direktur)
const getRecentOrdersDirektur = async (req, res) => {
    try {
        const recentOrders = await Pemesanan.find()
            .sort({ created_at: -1 })
            .limit(5)
            .select('nama jenis_jasa tanggal_kickoff status_pemesanan created_at')
            .lean();

        res.status(200).json({ recentOrders });
    } catch (error) {
        console.error("direkturPemesananController: Error getting recent orders:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil pesanan terbaru." });
    }
};

// Fungsi untuk mendapatkan rekapitulasi dashboard (Dashboard Direktur)
const getDashboardRecapDirektur = async (req, res) => {
    try {
        const totalOrders = await Pemesanan.countDocuments();
        const completedOrders = await Pemesanan.countDocuments({ status_pemesanan: "Selesai" });

        res.status(200).json({
            totalOrders,
            completedOrders
        });
    } catch (error) {
        console.error("direkturPemesananController: Error saat mendapatkan data rekap dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan data rekap.", error: error.message });
    }
};

// Fungsi untuk mendapatkan HTML rekap bulanan (untuk Direktur)
const getRecapHtmlDirektur = async (req, res) => {
    const { year, month } = req.params;

    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const pemesanans = await Pemesanan.find({
            tanggal_kickoff: {
                $gte: startDate,
                $lte: endDate
            },
        }).sort({ tanggal_kickoff: 1 }).lean();

        let rekapData = {};
        let totalOmset = 0;

        pemesanans.forEach(pemesanan => {
            const kickoffDate = new Date(pemesanan.tanggal_kickoff);
            const dateKey = kickoffDate.toISOString().split('T')[0];

            if (!rekapData[dateKey]) {
                rekapData[dateKey] = {
                    date: kickoffDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    dailyOrders: [],
                    dailyTotal: 0
                };
            }
            const transactionAmount = pemesanan.harga_jasa;
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
        console.error('direkturPemesananController: Error saat membuat rekap HTML (Direktur):', err);
        res.status(500).send('Terjadi kesalahan saat membuat rekap HTML: ' + err.message);
    }
};

// Fungsi untuk generate PDF rekap bulanan (untuk Direktur)
const generatePdfRecapDirektur = async (req, res) => {
    const { year, month } = req.params;

    try {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (!token) {
            console.error("direkturPemesananController: Token autentikasi tidak ditemukan saat mencoba generate PDF.");
            return res.status(401).json({ message: 'Tidak terautentikasi. Token tidak ditemukan.' });
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        // Penting: URL ini harus mengarah ke rute HTML rekap yang dilindungi oleh otorisasi Direktur
        const urlToRender = `http://localhost:${process.env.PORT || 5000}/api/direktur-pemesanan/rekap-bulanan-html/${year}/${month}`; // KOREKSI URL ke rute Direktur

        await page.setExtraHTTPHeaders({
            'Authorization': `Bearer ${token}`
        });

        await page.goto(urlToRender, { waitUntil: 'networkidle0' });

        const pageContent = await page.content();
        if (pageContent.includes("Akses ditolak") || pageContent.includes("Unauthorized") || pageContent.includes("Forbidden") || pageContent.includes("Error")) {
            console.error("direkturPemesananController: Puppeteer gagal mendapatkan konten rekap HTML. Kemungkinan masalah autentikasi atau error server di rute HTML.");
            console.error("Konten Halaman Error (sebagian):", pageContent.substring(0, 500));
            await browser.close();
            return res.status(403).json({
                message: "Gagal membuat PDF: Akses ditolak. Membutuhkan peran direktur."
            });
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rekap-pemesanan-direktur-${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '-')}.pdf"`);
        res.send(pdfBuffer);

    } catch (err) {
        console.error('direkturPemesananController: Error generating PDF (Direktur):', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF: ' + err.message });
    }
};

// Fungsi untuk mendapatkan tren pesanan bulanan (Dashboard Direktur)
const getMonthlyOrderTrendsDirektur = async (req, res) => {
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
        console.error("direkturPemesananController: Error getting monthly order trends:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil tren pesanan bulanan.", error: error.message });
    }
};

// Fungsi untuk mendapatkan distribusi status pesanan (Dashboard Direktur)
const getOrderStatusDistributionDirektur = async (req, res) => {
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
        console.error("direkturPemesananController: Error getting order status distribution:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil distribusi status pesanan.", error: error.message });
    }
};

module.exports = {
    getAllPemesananDirektur,
    getPendingPaymentsCountDirektur,
    getMonthlyOrdersCountDirektur,
    getTotalUsersCountDirektur,
    getRecentOrdersDirektur,
    getDashboardRecapDirektur,
    getRecapHtmlDirektur,
    generatePdfRecapDirektur,
    getMonthlyOrderTrendsDirektur,
    getOrderStatusDistributionDirektur
};
