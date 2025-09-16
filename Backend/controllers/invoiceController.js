const fs = require('fs');
const path = require('path');
const Pemesanan = require('../models/Pemesanan');
const Invoice = require('../models/invoice');
const Pembayaran = require('../models/Pembayaran'); 
const mongoose = require("mongoose"); 
const puppeteer = require('puppeteer');

// Fungsi untuk membuat catatan pembayaran baru setelah upload bukti bayar
const createPembayaran = async (req, res) => {
    try {
        console.log("Request pembayaran diterima:", req.body);
        console.log("File yang diupload:", req.file);

        const { pemesanan_id, tipe_pembayaran } = req.body; 
        const bukti_pembayaran_filename = req.file ? req.file.filename : null;

        // Validasi pemesanan_id
        if (!mongoose.Types.ObjectId.isValid(pemesanan_id)) {
            console.error("Error: pemesanan_id tidak valid!");
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ message: "ID pemesanan tidak valid." });
        }

        // Cari pemesanan
        const pemesanan = await Pemesanan.findById(pemesanan_id);
        if (!pemesanan) {
            console.error("Error: Pemesanan tidak ditemukan!");
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(404).json({ message: "Pemesanan tidak ditemukan." });
        }

        // Cek jika pemesanan sudah lunas
        if (pemesanan.status_pembayaran_detail === 'Lunas') {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ success: false, message: "Pemesanan ini sudah lunas." });
        }

        let jumlahBayarSaatIni;
        if (tipe_pembayaran === 'DP') {
            jumlahBayarSaatIni = pemesanan.harga_jasa * 0.5;

            if (pemesanan.status_pembayaran_detail === 'DP Terbayar' || pemesanan.status_pembayaran_detail === 'Menunggu Validasi') {
                if (req.file && bukti_pembayaran_filename) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
                }
                return res.status(400).json({ success: false, message: "Down Payment sudah dibayar atau sedang menunggu validasi." });
            }

        } else if (tipe_pembayaran === 'Pelunasan') {
            jumlahBayarSaatIni = pemesanan.sisa_tagihan;
            
            if (jumlahBayarSaatIni <= 0) {
                if (req.file && bukti_pembayaran_filename) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
                }
                return res.status(400).json({ success: false, message: "Tidak ada sisa tagihan untuk dilunasi." });
            }
            if (pemesanan.status_pembayaran_detail !== 'DP Terbayar' && pemesanan.status_pembayaran_detail !== 'Menunggu Validasi') { // Tambahkan 'Menunggu Validasi' untuk jaga-jaga
                if (req.file && bukti_pembayaran_filename) {
                    fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
                }
                return res.status(400).json({ success: false, message: "Pelunasan hanya bisa dilakukan setelah Down Payment terbayar atau sedang menunggu validasi." });
            }
        } else {
            if (req.file && bukti_pembayaran_filename) {
                fs.unlinkSync(path.join(__dirname, '../uploads', bukti_pembayaran_filename));
            }
            return res.status(400).json({ success: false, message: "Tipe pembayaran tidak valid." });
        }

        console.log("Jumlah bayar yang akan disimpan untuk transaksi ini:", jumlahBayarSaatIni);

        let existingPayment = await Pembayaran.findOne({ pemesanan_id: pemesanan_id, tipe_pembayaran: tipe_pembayaran });

        if (existingPayment) {
            if (existingPayment.bukti_pembayaran && existingPayment.bukti_pembayaran !== bukti_pembayaran_filename) {
                fs.unlink(path.join(__dirname, '../uploads', existingPayment.bukti_pembayaran), (err) => {
                    if (err) console.error("Gagal menghapus bukti pembayaran lama:", err);
                });
            }
            existingPayment.bukti_pembayaran = bukti_pembayaran_filename;
            existingPayment.tanggal_transaksi = Date.now();
            existingPayment.jumlah_pembayaran = jumlahBayarSaatIni; 
            existingPayment.status = 'Menunggu Validasi'; 
            await existingPayment.save();
        } else {
            const newPayment = new Pembayaran({
                pemesanan_id: pemesanan_id,
                jumlah_pembayaran: jumlahBayarSaatIni,
                tanggal_transaksi: Date.now(),
                metode_pembayaran: 'Transfer Bank',
                bukti_pembayaran: bukti_pembayaran_filename,
                tipe_pembayaran: tipe_pembayaran,
                status: 'Menunggu Validasi'
            });
            existingPayment = await newPayment.save();
        }

        pemesanan.status_pembayaran_detail = 'Menunggu Validasi';
        await pemesanan.save();

        console.log("Pembayaran berhasil dibuat/diperbarui:", existingPayment);
        return res.status(201).json({
            message: "Pembayaran berhasil diupload dan menunggu validasi.",
            pembayaran: existingPayment
        });
    } catch (error) {
        console.error("Error saat membuat pembayaran:", error);
        if (req.file && req.file.filename) {
            fs.unlink(path.join(__dirname, '../uploads', req.file.filename), (err) => {
                if (err) console.error("Gagal menghapus file yang error:", err);
            });
        }
        return res.status(500).json({
            message: "Terjadi kesalahan saat membuat pembayaran.",
            error: error.message
        });
    }
};

const getPembayaranByPemesanan = async (req, res) => {
    try {
        const { pemesanan_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pemesanan_id)) {
            return res.status(400).json({ message: "ID pemesanan tidak valid." });
        }

        const pembayaran = await Pembayaran.find({ pemesanan_id: pemesanan_id }).sort({ tanggal_transaksi: -1 });

        if (!pembayaran || pembayaran.length === 0) {
            return res.status(404).json({ message: "Tidak ada riwayat pembayaran untuk pemesanan ini." });
        }

        res.status(200).json({
            message: "Riwayat pembayaran ditemukan.",
            data: pembayaran
        });
    } catch (error) {
        console.error("Error saat mengambil pembayaran berdasarkan pemesanan:", error);
        res.status(500).json({
            message: "Terjadi kesalahan saat mengambil data pembayaran.",
            error: error.message
        });
    }
};

// Fungsi untuk menghasilkan invoice PDF dan menyimpannya
const generateInvoicePdfAndSave = async (pemesananId, invoiceType) => {
    try {
        const pemesanan = await Pemesanan.findById(pemesananId).populate('user_id');

        if (!pemesanan) {
            console.error(`Pemesanan dengan ID ${pemesananId} tidak ditemukan untuk pembuatan invoice.`);
            throw new Error('Pemesanan tidak ditemukan.');
        }

        const namaPelanggan = pemesanan.user_id?.name || pemesanan.nama || 'Pelanggan Tidak Dikenal';
        const emailPelanggan = pemesanan.user_id?.email || pemesanan.email || 'N/A';
        const noTeleponPelanggan = pemesanan.user_id?.phone || pemesanan.no_telepon || 'N/A';
        const alamatPelanggan = pemesanan.user_id?.alamat || pemesanan.alamat || 'N/A';

        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        if (!fs.existsSync(templatePath)) {
            console.error(`Template invoice tidak ditemukan di: ${templatePath}`);
            throw new Error('Template invoice (HTML) tidak ditemukan di server.');
        }
        let template = fs.readFileSync(templatePath, 'utf8');

        let pesananRows = '';
        let totalPesanan = pemesanan.harga_jasa || 0;
        let jumlahYangDibayarDiInvoiceIni = 0;
        let sisaTagihanTampil = 0;
        let jenisInvoiceLabel = '';

        if (invoiceType.toLowerCase() === 'dp') {
            jumlahYangDibayarDiInvoiceIni = totalPesanan / 2;
            sisaTagihanTampil = totalPesanan - jumlahYangDibayarDiInvoiceIni;
            jenisInvoiceLabel = 'DP';
        } else if (invoiceType.toLowerCase() === 'pelunasan') {
            jumlahYangDibayarDiInvoiceIni = pemesanan.sisa_tagihan || 0;
            sisaTagihanTampil = 0; 
            jenisInvoiceLabel = 'Pelunasan';
        } else { // Default atau 'Full Payment'
            jumlahYangDibayarDiInvoiceIni = totalPesanan;
            sisaTagihanTampil = 0;
            jenisInvoiceLabel = 'Full Payment';
        }

        if (pemesanan.jenis_jasa && pemesanan.harga_jasa !== undefined) {
            const namaJasa = pemesanan.jenis_jasa;
            const harga = pemesanan.harga_jasa;
            pesananRows += `
                <tr>
                    <td>1</td>
                    <td>${namaJasa}</td>
                    <td>Rp ${harga.toLocaleString('id-ID')}</td>
                </tr>
            `;
        } else {
            pesananRows += `<tr><td colspan="3">Detail jasa tidak tersedia.</td></tr>`;
            console.warn(`Pemesanan ID ${pemesananId} tidak memiliki detail jasa yang valid untuk invoice.`);
        }

        template = template.replace('{{nama}}', namaPelanggan);
        template = template.replace('{{email}}', emailPelanggan);
        template = template.replace('{{no_telepon}}', noTeleponPelanggan);
        template = template.replace('{{alamat_user}}', alamatPelanggan);
        template = template.replace('{{tanggal}}', new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }));
        template = template.replace('{{nomor}}', pemesananId.toString()); 
        template = template.replace('{{pesanan}}', pesananRows);
        template = template.replace('{{jenis_invoice}}', jenisInvoiceLabel);
        template = template.replace('{{sisa_tagihan}}', sisaTagihanTampil.toLocaleString('id-ID'));
        template = template.replace('{{total}}', jumlahYangDibayarDiInvoiceIni.toLocaleString('id-ID'));

        const invoiceDir = path.join(__dirname, '../uploads/invoice');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir, { recursive: true });
        }

        let fileName = `invoice_${pemesananId}.pdf`;
        let invoiceUrlFieldToUpdate = 'invoiceUrl'; 
        if (invoiceType.toLowerCase() === 'dp') {
            fileName = `invoice_${pemesananId}_dp.pdf`;
            invoiceUrlFieldToUpdate = 'invoiceUrlDP';
        } else if (invoiceType.toLowerCase() === 'pelunasan') {
            fileName = `invoice_${pemesananId}_pelunasan.pdf`;
            invoiceUrlFieldToUpdate = 'invoiceUrlPelunasan';
        }

        const filePath = path.join(invoiceDir, fileName);

        let browser;
        try {
            browser = await puppeteer.launch({ 
                headless: true, 
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox', 
                    '--disable-gpu',
                    '--disable-dev-shm-usage' 
                ]
            });
            const page = await browser.newPage();
            await page.setContent(template, { waitUntil: 'networkidle0' }); 
            await page.pdf({ path: filePath, format: 'A4', printBackground: true }); 
            
            console.log(`PDF berhasil dibuat: ${filePath}`);

            pemesanan[invoiceUrlFieldToUpdate] = `/uploads/invoice/${fileName}`;
            
            // `sisa_tagihan` seharusnya sudah diperbarui di `validasiController.js` saat pembayaran dikonfirmasi.
            // Baris ini bisa dihapus atau dikomentari untuk menghindari redundansi/potensi konflik.
            // if (invoiceType.toLowerCase() === 'dp') {
            //      pemesanan.sisa_tagihan = totalPesanan - jumlahYangDibayarDiInvoiceIni;
            //      if (pemesanan.sisa_tagihan < 0) pemesanan.sisa_tagihan = 0;
            // } else if (invoiceType.toLowerCase() === 'pelunasan') {
            //      pemesanan.sisa_tagihan = 0;
            // } else { 
            //      pemesanan.sisa_tagihan = 0;
            // }

            // POINT 3: Ubah status pemesanan utama menjadi "Selesai" setelah invoice Pelunasan dikirim
            if (invoiceType.toLowerCase() === 'pelunasan') {
                pemesanan.status_pemesanan = 'Selesai'; 
            }
            // Untuk invoice DP, status pemesanan utama sudah 'Diproses' dari validasiController.
            // Tidak perlu mengubah status_pemesanan di sini lagi.

            await pemesanan.save();
            console.log('Dokumen Pemesanan berhasil diperbarui dengan URL invoice:', pemesanan[invoiceUrlFieldToUpdate]);

            try {
                const newInvoice = new Invoice({
                    pemesanan: pemesanan._id,
                    namaPemesan: namaPelanggan,
                    emailPemesan: emailPelanggan,
                    detailJasa: [{ namaJasa: pemesanan.jenis_jasa, harga: pemesanan.harga_jasa }],
                    totalHargaInvoice: jumlahYangDibayarDiInvoiceIni,
                    invoiceUrl: `/uploads/invoice/${fileName}`,
                    nomorInvoice: pemesananId.toString() + (invoiceType === 'dp' ? '-DP' : (invoiceType === 'pelunasan' ? '-PEL' : '')),
                    tanggalInvoice: new Date(),
                    jenisInvoice: jenisInvoiceLabel
                });
                await newInvoice.save();
                console.log('Dokumen Invoice berhasil disimpan di koleksi `invoices`:', newInvoice);
            } catch (invoiceSaveError) {
                console.error('Gagal menyimpan dokumen Invoice baru ke database:', invoiceSaveError);
            }

            return pemesanan[invoiceUrlFieldToUpdate]; 

        } finally {
            if (browser) {
                await browser.close(); 
            }
        }

    } catch (error) {
        console.error('Terjadi kesalahan di generateInvoicePdfAndSave:', error);
        throw error; 
    }
};

const generateInvoiceEndpoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // Mengambil 'type' dari body request
        const invoiceType = type || 'Full Payment'; 

        console.log(`Memanggil generateInvoicePdfAndSave untuk Pemesanan ID: ${id}, Tipe: ${invoiceType}`);
        const invoiceUrl = await generateInvoicePdfAndSave(id, invoiceType);

        res.status(200).json({
            message: `Invoice ${invoiceType} berhasil dibuat dan disimpan.`,
            invoiceUrl: invoiceUrl
        });
    } catch (error) {
        console.error('Error di generateInvoiceEndpoint:', error);
        res.status(500).json({ message: 'Terjadi kesalahan internal server', error: error.message });
    }
};

module.exports = {
    createPembayaran,
    getPembayaranByPemesanan,
    // konfirmasiPembayaran, // Ini tidak diperlukan di sini, adanya di validasiController
    generateInvoicePdfAndSave, 
    generateInvoice: generateInvoiceEndpoint 
};
