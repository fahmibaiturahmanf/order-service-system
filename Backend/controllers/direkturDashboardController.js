const Pemesanan = require("../models/Pemesanan");
const User = require('../models/User'); 
const puppeteer = require('puppeteer'); 

// FUNGSI UNTUK DASHBOARD DAN REKAPITULASI UNTUK DIREKTUR
const getPendingPaymentsCount = async (req, res) => {
    try {
        const count = await Pemesanan.countDocuments({
            status_pembayaran_detail: "Menunggu Validasi"
        });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting pending payments count for direktur dashboard:", error);
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
        console.error("Error getting monthly orders count for direktur dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pesanan bulan ini." });
    }
};

const getTotalUsersCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting total users count for direktur dashboard:", error);
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
        console.error("Error getting recent orders for direktur dashboard:", error);
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
        console.error("Error saat mendapatkan data rekap dashboard direktur:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan data rekap.", error: error.message });
    }
};

const getRecapHtml = async (req, res) => {
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
        console.error('Error saat membuat rekap HTML untuk direktur dashboard:', err);
        res.status(500).send('Terjadi kesalahan saat membuat rekap HTML: ' + err.message);
    }
};

const generatePdfRecap = async (req, res) => {
    const { year, month } = req.params;

    try {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (!token) {
            console.error("Token autentikasi tidak ditemukan saat mencoba generate PDF untuk direktur dashboard.");
            return res.status(401).json({ message: 'Tidak terautentikasi. Token tidak ditemukan.' });
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const urlToRender = `http://localhost:${process.env.PORT || 5000}/api/direktur-dashboard/rekap-html/${year}/${month}`;

        await page.setExtraHTTPHeaders({
            'Authorization': `Bearer ${token}`
        });

        await page.goto(urlToRender, { waitUntil: 'networkidle0' });

        const pageContent = await page.content();
        if (pageContent.includes("Akses ditolak") || pageContent.includes("Unauthorized") || pageContent.includes("Forbidden") || pageContent.includes("Error")) {
            console.error("Puppeteer gagal mendapatkan konten rekap HTML untuk direktur dashboard.");
            await browser.close();
            return res.status(403).json({ message: "Gagal membuat PDF: Akses ditolak. Membutuhkan peran direktur." });
        }

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="rekap-pemesanan-${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '-')}.pdf"`);
        res.send(pdfBuffer);

    } catch (err) {
        console.error('Error generating PDF for direktur dashboard:', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF: ' + err.message });
    }
};

const getMonthlyOrderTrends = async (req, res) => {
    try {
        const now = new Date();
        const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        const trends = await Pemesanan.aggregate([
            { $match: { created_at: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formattedTrends = trends.map(item => ({
            name: `${item._id.month}/${item._id.year % 100}`,
            uv: item.count
        }));

        res.status(200).json(formattedTrends);
    } catch (error) {
        console.error("Error getting monthly order trends for direktur dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil tren pesanan bulanan." });
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
        console.error("Error getting order status distribution for direktur dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil distribusi status pesanan." });
    }
};

module.exports = {
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
