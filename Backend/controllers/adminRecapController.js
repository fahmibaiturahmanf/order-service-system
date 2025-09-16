const Pemesanan = require("../models/Pemesanan");
const User = require('../models/User');
const puppeteer = require('puppeteer');
const path = require('path');

// Fungsi ini untuk mengambil **jumlah pemesanan** yang status pembayarannya "Menunggu Validasi".
// Berguna untuk dashboard atau notifikasi.
const getPendingPaymentsCount = async (req, res) => {
    try {
        // Hitung dokumen Pemesanan dengan 'status_pembayaran_detail' "Menunggu Validasi".
        const count = await Pemesanan.countDocuments({
            status_pembayaran_detail: "Menunggu Validasi"
        });
        // Kirim jumlahnya.
        res.status(200).json({ count });
    } catch (error) {
        // Tangani error jika terjadi masalah saat menghitung.
        console.error("Error getting pending payments count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pembayaran tertunda." });
    }
};

// Fungsi ini untuk mengambil **jumlah pesanan** yang terjadi pada **bulan ini**.
// Ini bagus untuk metrik bulanan di dashboard Anda.
const getMonthlyOrdersCount = async (req, res) => {
    try {
        // Ambil tanggal saat ini.
        const now = new Date();
        // Set tanggal awal bulan ini (misal: 1 Juli 2025).
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Set tanggal akhir bulan ini (misal: 31 Juli 2025).
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Hitung dokumen Pemesanan di mana 'created_at' berada di rentang bulan ini.
        const count = await Pemesanan.countDocuments({
            created_at: {
                $gte: startOfMonth, // Lebih besar atau sama dengan (dari awal bulan)
                $lte: endOfMonth    // Lebih kecil atau sama dengan (sampai akhir bulan)
            }
        });
        // Kirim jumlahnya.
        res.status(200).json({ count });
    } catch (error) {
        // Tangani error.
        console.error("Error getting monthly orders count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pesanan bulan ini." });
    }
};

// Fungsi ini untuk mengambil **jumlah total semua user** yang terdaftar.
// Statistik sederhana untuk jumlah user.
const getTotalUsersCount = async (req, res) => {
    try {
        // Hitung semua dokumen di koleksi User.
        const count = await User.countDocuments();
        // Kirim jumlahnya.
        res.status(200).json({ count });
    } catch (error) {
        // Tangani error.
        console.error("Error getting total users count:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil jumlah pengguna." });
    }
};

// Fungsi ini untuk mengambil **5 pesanan terbaru**.
// Biasanya ditampilkan di bagian "Pesanan Terbaru" di dashboard.
const getRecentOrders = async (req, res) => {
    try {
        // Cari dokumen Pemesanan.
        const recentOrders = await Pemesanan.find()
            // Urutkan dari yang paling baru ('created_at' descending).
            .sort({ created_at: -1 })
            // Ambil hanya 5 dokumen teratas.
            .limit(5)
            // Pilih hanya field-field yang Anda butuhkan untuk ditampilkan.
            .select('nama jenis_jasa tanggal_kickoff status_pemesanan created_at')
            // Ubah dokumen Mongoose ke objek JavaScript biasa untuk performa lebih baik.
            .lean();

        // Kirim daftar pesanan terbaru.
        res.status(200).json({ recentOrders });
    } catch (error) {
        // Tangani error.
        console.error("Error getting recent orders:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil pesanan terbaru." });
    }
};

// Fungsi ini untuk mengambil **ringkasan data dashboard**: total pesanan dan pesanan yang selesai.
// Ini adalah metrik kunci untuk gambaran umum.
const getDashboardRecap = async (req, res) => {
    try {
        // Hitung total semua pesanan.
        const totalOrders = await Pemesanan.countDocuments();
        // Hitung pesanan yang statusnya "Selesai".
        const completedOrders = await Pemesanan.countDocuments({ status_pemesanan: "Selesai" });

        // Kirim kedua jumlah tersebut.
        res.status(200).json({
            totalOrders,
            completedOrders
        });
    } catch (error) {
        // Tangani error.
        console.error("Error saat mendapatkan data rekap dashboard:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mendapatkan data rekap.", error: error.message });
    }
};

// Fungsi ini untuk **memperbarui status pemesanan**.
// Otomatis mengisi 'tanggal_selesai' jika status diubah menjadi "Selesai".
const updateStatusPemesanan = async (req, res) => {
    // Ambil ID pemesanan dari URL.
    const { id } = req.params;
    // Ambil status pemesanan baru dari body request.
    const { status_pemesanan } = req.body;

    try {
        // Siapkan data yang akan diupdate.
        const updateData = { status_pemesanan };

        // Cek jika status baru adalah "Selesai".
        if (status_pemesanan === "Selesai") {
            // Jika ya, isi 'tanggal_selesai' dengan tanggal saat ini.
            updateData.tanggal_selesai = new Date();
        }

        // Cari pemesanan berdasarkan ID dan update datanya.
        // `new: true` mengembalikan dokumen setelah diupdate.
        const updated = await Pemesanan.findByIdAndUpdate(id, updateData, { new: true });

        // Jika pemesanan tidak ditemukan, kembalikan 404.
        if (!updated) {
            return res.status(404).json({ message: "Pemesanan tidak ditemukan" });
        }

        // Kirim respons sukses.
        res.status(200).json({ message: "Status pemesanan berhasil diperbarui", data: updated });
    } catch (error) {
        // Tangani error.
        console.error("Gagal update status pemesanan:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat update status pemesanan." });
    }
};

// Fungsi ini untuk **merender halaman HTML rekap bulanan**.
// Halaman ini akan menjadi sumber untuk preview atau untuk di-generate jadi PDF.
const getRecapHtml = async (req, res) => {
    // Ambil tahun dan bulan dari URL.
    const { year, month } = req.params;

    try {
        // Tentukan tanggal mulai bulan yang diminta.
        const startDate = new Date(year, month - 1, 1);
        // Tentukan tanggal akhir bulan yang diminta.
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Logging untuk debugging, bisa dihapus di produksi.
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

        // Cari pemesanan yang statusnya "Selesai" dan tanggal selesainya di rentang bulan ini.
        const pemesanans = await Pemesanan.find({
            status_pemesanan: "Selesai",
            tanggal_selesai: {
                $gte: startDate,
                $lte: endDate
            },
        }).sort({ tanggal_selesai: 1 }).lean(); // Urutkan dan ubah ke objek JS biasa.

        console.log("Jumlah pemesanan ditemukan:", pemesanans.length); // Logging jumlah data.

        // Objek untuk menampung data rekap per tanggal.
        let rekapData = {};
        // Total omset bulanan.
        let totalOmset = 0;

        // Loop setiap pemesanan yang ditemukan.
        pemesanans.forEach(pemesanan => {
            const selesaiDate = new Date(pemesanan.tanggal_selesai);
            const dateKey = selesaiDate.toISOString().split('T')[0]; // Format tanggal jadi YYYY-MM-DD.

            // Jika tanggal ini belum ada di rekapData, inisialisasi.
            if (!rekapData[dateKey]) {
                rekapData[dateKey] = {
                    date: selesaiDate.toLocaleDateString('id-ID', { // Format tanggal untuk tampilan.
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }),
                    dailyOrders: [], // Array untuk pesanan di hari ini.
                    dailyTotal: 0    // Total pendapatan di hari ini.
                };
            }

            const transactionAmount = pemesanan.harga_jasa;

            // Tambahkan detail pesanan ke daftar harian.
            rekapData[dateKey].dailyOrders.push({
                nama: pemesanan.nama,
                jenis_jasa: pemesanan.jenis_jasa,
                harga_jasa: pemesanan.harga_jasa,
                status_pemesanan: pemesanan.status_pemesanan,
                status_pembayaran_detail: pemesanan.status_pembayaran_detail,
                total: transactionAmount
            });

            // Tambahkan ke total harian dan total omset bulanan.
            rekapData[dateKey].dailyTotal += transactionAmount;
            totalOmset += transactionAmount;
        });

        // Ubah objek rekapData menjadi array agar mudah diiterasi di template.
        const rekapArray = Object.values(rekapData);

        // Render file EJS 'rekap.ejs' dengan data yang sudah diproses.
        // Ini akan menghasilkan HTML yang bisa ditampilkan.
        res.render(path.join(__dirname, '../views/rekap.ejs'), {
            rekapArray,
            totalOmset,
            month: new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' }), // Nama bulan.
            year
        });

    } catch (err) {
        // Tangani error saat membuat HTML rekap.
        console.error('Error saat membuat rekap HTML:', err);
        res.status(500).send('Terjadi kesalahan saat membuat rekap HTML: ' + err.message);
    }
};

// Fungsi ini untuk **men-generate PDF** dari halaman rekap HTML menggunakan Puppeteer.
// Ini memungkinkan unduh laporan bulanan.
const generatePdfRecap = async (req, res) => {
    // Ambil tahun dan bulan dari URL.
    const { year, month } = req.params;

    try {
        // Ambil token autentikasi dari header. Ini penting jika halaman rekap dilindungi.
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (!token) {
            console.error("Token autentikasi tidak ditemukan saat mencoba generate PDF.");
            return res.status(401).json({ message: 'Tidak terautentikasi. Token tidak ditemukan.' });
        }

        // Luncurkan browser headless (latar belakang).
        // Argumen '--no-sandbox' dan '--disable-setuid-sandbox' seringkali diperlukan di server.
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        // Buka halaman baru di browser.
        const page = await browser.newPage();

        // Tentukan URL halaman HTML rekap yang akan dijadikan PDF.
        const urlToRender = `http://localhost:${process.env.PORT || 5000}/api/admin-recap/rekap-bulanan/${year}/${month}`;

        // Set header autentikasi agar Puppeteer bisa mengakses halaman yang dilindungi.
        await page.setExtraHTTPHeaders({
            'Authorization': `Bearer ${token}`
        });

        // Buka URL dan tunggu hingga semua jaringan stabil.
        await page.goto(urlToRender, { waitUntil: 'networkidle0' });

        // Ambil konten HTML halaman.
        const pageContent = await page.content();
        // Cek apakah halaman yang dimuat Puppeteer mengindikasikan error akses.
        if (pageContent.includes("Akses ditolak") || pageContent.includes("Unauthorized") || pageContent.includes("Forbidden") || pageContent.includes("Error")) {
            console.error("Puppeteer gagal mendapatkan konten rekap HTML.");
            console.error("Konten Halaman Error (sebagian):", pageContent.substring(0, 500));
            await browser.close();
            return res.status(403).json({
                message: "Gagal membuat PDF: Akses ditolak. Membutuhkan peran admin atau direktur."
            });
        }

        // Buat PDF dari halaman yang sedang terbuka.
        const pdfBuffer = await page.pdf({
            format: 'A4',         // Ukuran kertas A4.
            printBackground: true, // Cetak latar belakang (warna, gambar).
            margin: {             // Atur margin PDF.
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });

        // Tutup browser setelah selesai.
        await browser.close();

        // Atur header respons sebagai file PDF.
        res.setHeader('Content-Type', 'application/pdf');
        // Atur nama file yang akan diunduh.
        res.setHeader('Content-Disposition', `attachment; filename="rekap-pemesanan-${new Date(year, month - 1).toLocaleString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '-')}.pdf"`);
        // Kirim file PDF.
        res.send(pdfBuffer);

    } catch (err) {
        // Tangani error saat membuat PDF.
        console.error('Error generating PDF (controller):', err);
        res.status(500).json({ message: 'Terjadi kesalahan saat membuat PDF: ' + err.message });
    }
};

// Fungsi ini untuk mengambil **tren jumlah pesanan selama 12 bulan terakhir**.
// Hasilnya bagus untuk grafik tren di dashboard.
const getMonthlyOrderTrends = async (req, res) => {
    try {
        const now = new Date();
        // Dapatkan tanggal 12 bulan yang lalu.
        const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

        // Gunakan Aggregation Pipeline MongoDB.
        const trends = await Pemesanan.aggregate([
            {
                // Tahap $match: Filter dokumen yang dibuat dalam 12 bulan terakhir.
                $match: {
                    created_at: { $gte: twelveMonthsAgo }
                }
            },
            {
                // Tahap $group: Kelompokkan dokumen berdasarkan tahun dan bulan
                // dan hitung jumlahnya.
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" }
                    },
                    count: { $sum: 1 } // Hitung jumlah dokumen per grup.
                }
            },
            {
                // Tahap $sort: Urutkan hasil berdasarkan tahun lalu bulan, secara ascending.
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Format hasil agar sesuai untuk library grafik (misal: Recharts).
        const formattedTrends = trends.map(item => ({
            name: `${item._id.month}/${item._id.year % 100}`, // Format nama bulan/tahun (misal: "7/25").
            uv: item.count // 'uv' adalah convention nama untuk value di beberapa library grafik.
        }));

        // Kirim data tren.
        res.status(200).json(formattedTrends);
    } catch (error) {
        // Tangani error.
        console.error("Error getting monthly order trends:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil tren pesanan bulanan.", error: error.message });
    }
};

// Fungsi ini untuk mengambil **distribusi status pesanan** (berapa banyak yang "Selesai", "Diproses", dll.).
// Ini cocok untuk membuat pie chart atau grafik distribusi lainnya.
const getOrderStatusDistribution = async (req, res) => {
    try {
        // Gunakan Aggregation Pipeline MongoDB.
        const distribution = await Pemesanan.aggregate([
            {
                // Tahap $group: Kelompokkan dokumen berdasarkan 'status_pemesanan'
                // dan hitung jumlahnya.
                $group: {
                    _id: "$status_pemesanan", // Kelompokkan berdasarkan nilai dari field ini.
                    count: { $sum: 1 }      // Hitung jumlah dokumen di setiap grup.
                }
            },
            {
                // Tahap $project: Ubah format output agar lebih rapi untuk chart.
                $project: {
                    name: "$_id",   // Ubah '_id' menjadi 'name' (nama status).
                    value: "$count", // Ubah 'count' menjadi 'value' (jumlah).
                    _id: 0          // Hilangkan field '_id' yang tidak diperlukan di output.
                }
            }
        ]);

        // Kirim data distribusi.
        res.status(200).json(distribution);
    } catch (error) {
        // Tangani error.
        console.error("Error getting order status distribution:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil distribusi status pesanan.", error: error.message });
    }
};

// Eksport semua fungsi agar bisa digunakan di file lain (misal: file route).
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