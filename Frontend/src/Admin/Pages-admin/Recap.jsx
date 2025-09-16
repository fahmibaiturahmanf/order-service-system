import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { getToken } from '../../utils/auth';
import './recap.css';

// Mendefinisikan komponen fungsional React bernama Recap.
function Recap() {
    // Mendefinisikan state untuk menyimpan bulan yang dipilih.
    // 'month' akan menyimpan nilai bulan, 'setMonth' adalah fungsi untuk mengubahnya.
    const [month, setMonth] = useState('');
    // Mendefinisikan state untuk menyimpan tahun yang dipilih.
    const [year, setYear] = useState('');
    // Mendefinisikan state untuk menyimpan pesan feedback kepada pengguna (misal: "PDF berhasil dibuat").
    const [message, setMessage] = useState('');
    // Mendefinisikan state untuk menyimpan tipe pesan (misal: 'success', 'error', 'info')
    // untuk styling CSS pesan.
    const [messageType, setMessageType] = useState('');

    // Hook useEffect: Berjalan setelah render pertama komponen.
    // Digunakan untuk mengatur nilai awal bulan dan tahun saat komponen dimuat.
    useEffect(() => {
        // Mendapatkan bulan saat ini (fungsi getMonth() mengembalikan 0-11, jadi +1 untuk 1-12).
        const currentMonth = new Date().getMonth() + 1;
        // Mengatur state 'month' ke bulan saat ini, diubah ke string.
        setMonth(currentMonth.toString());

        // Mendapatkan tahun saat ini.
        const currentYear = new Date().getFullYear();
        // Mengatur state 'year' ke tahun saat ini, diubah ke string.
        setYear(currentYear.toString());

        // Log untuk debugging, menunjukkan komponen sudah dimuat dan nilai awal.
        console.log('Recap Component Mounted.');
        console.log('Initial Month:', currentMonth);
        console.log('Initial Year:', currentYear);

        // Mengambil token autentikasi dari local storage (bisa dari user, admin, atau direktur).
        const initialToken = getToken('user') || getToken('admin') || getToken('direktur');
        // Log status token saat komponen dimuat.
        console.log('Token from localStorage on mount:', initialToken ? 'Token Ditemukan' : 'Token Tidak Ditemukan');
    }, []); // Array dependensi kosong berarti efek ini hanya berjalan sekali setelah render pertama.

    // Fungsi asinkron untuk menangani pembuatan PDF rekap.
    const handleGeneratePdf = async () => {
        // Log untuk debugging.
        console.log('handleGeneratePdf called.');
        console.log('Selected Month:', month);
        console.log('Selected Year:', year);

        // Validasi input: Cek apakah bulan atau tahun sudah dipilih.
        if (!month || !year) {
            setMessage('Mohon pilih bulan dan tahun terlebih dahulu.');
            setMessageType('error');
            return; // Hentikan eksekusi fungsi jika validasi gagal.
        }

        // Tampilkan pesan loading saat PDF sedang dibuat.
        setMessage('Sedang membuat PDF... Mohon tunggu.');
        setMessageType('info');

        try {
            // Mengambil token autentikasi dari local storage untuk dikirim ke backend.
            const token = getToken('user') || getToken('admin') || getToken('direktur');

            // Cek jika token tidak ditemukan.
            if (!token) {
                setMessage('Tidak terautentikasi. Silakan login kembali.');
                setMessageType('error');
                return; // Hentikan jika tidak ada token.
            }

            // Membangun URL untuk permintaan ke backend.
            // Contoh: /admin-recap/generate-pdf/2024/7
            const url = `/admin-recap/generate-pdf/${year}/${month}`;
            console.log('Sending GET request to:', url);

            // Melakukan permintaan GET ke backend menggunakan axiosInstance.
            // responseType: 'blob' sangat penting karena backend akan mengirimkan file biner (PDF).
            const response = await axiosInstance.get(url, {
                responseType: 'blob', // Menginstruksikan Axios untuk menganggap respons sebagai Blob.
            });

            // Membuat URL objek dari data Blob yang diterima dari respons.
            // Blob adalah objek seperti file yang berisi data biner.
            const fileUrl = window.URL.createObjectURL(new Blob([response.data]));

            // Membuat elemen '<a>' (link) secara dinamis di DOM.
            const link = document.createElement('a');
            // Mengatur href link ke URL objek yang baru dibuat.
            link.href = fileUrl;
            // Mengatur atribut 'download' untuk menentukan nama file saat diunduh.
            link.setAttribute('download', `rekap-pemesanan-${month}-${year}.pdf`);

            // Menambahkan link ke body dokumen HTML.
            document.body.appendChild(link);
            // Mensimulasikan klik pada link untuk memicu unduhan.
            link.click();
            // Menghapus elemen link dari DOM setelah diunduh (agar tidak menumpuk).
            link.remove();

            // Melepaskan URL objek untuk membebaskan memori browser.
            // Penting untuk dilakukan setelah file diunduh atau tidak lagi dibutuhkan.
            window.URL.revokeObjectURL(fileUrl);

            // Tampilkan pesan sukses.
            setMessage('PDF berhasil dibuat dan diunduh!');
            setMessageType('success');

        } catch (error) {
            // Tangani error jika terjadi masalah saat generate PDF.
            console.error('Error generating PDF:', error);
            // Tampilkan pesan error kepada pengguna.
            setMessage('Terjadi kesalahan saat membuat PDF. Mohon coba lagi.');
            setMessageType('error');
        }
    };

    // Fungsi asinkron untuk menangani melihat rekap (membuka di tab baru).
    const handleViewRecap = async () => {
        // Log untuk debugging.
        console.log('handleViewRecap called.');
        console.log('Selected Month:', month);
        console.log('Selected Year:', year);

        // Validasi input, sama seperti handleGeneratePdf.
        if (!month || !year) {
            setMessage('Mohon pilih bulan dan tahun terlebih dahulu.');
            setMessageType('error');
            return;
        }

        // Tampilkan pesan loading.
        setMessage('Sedang memuat rekap... Mohon tunggu.');
        setMessageType('info');

        try {
            // Mengambil token autentikasi.
            const token = getToken('user') || getToken('admin') || getToken('direktur');

            if (!token) {
                setMessage('Tidak terautentikasi. Silakan login kembali.');
                setMessageType('error');
                return;
            }

            // Membangun URL untuk permintaan ke backend (ini akan mengembalikan HTML).
            // Contoh: /admin-recap/rekap-bulanan/2024/7
            const url = `/admin-recap/rekap-bulanan/${year}/${month}`;
            console.log('Sending GET request to view recap:', url);

            // Melakukan permintaan GET ke backend.
            // responseType: 'blob' juga digunakan di sini, karena responsnya bisa HTML atau PDF (jika backend berubah).
            const response = await axiosInstance.get(url, {
                responseType: 'blob',
            });

            // Membuat Blob dengan data respons dan tipe konten dari header respons.
            // Ini penting agar browser tahu cara menginterpretasikan data (HTML, PDF, dll.).
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            // Membuat URL objek untuk Blob ini.
            const fileUrl = window.URL.createObjectURL(blob);

            // Membuka URL di tab atau jendela baru browser.
            window.open(fileUrl, '_blank');

            // Tampilkan pesan sukses.
            setMessage('Rekap berhasil ditampilkan!');
            setMessageType('success');

        } catch (error) {
            // Tangani error.
            console.error('Error viewing recap:', error);
            setMessage('Terjadi kesalahan saat melihat rekap. Mohon coba lagi.');
            setMessageType('error');
        }
    };

    // Data bulan dalam bentuk array objek untuk mengisi dropdown bulan.
    const months = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    // Fungsi untuk menghasilkan daftar tahun secara dinamis.
    // Ini yang membuat dropdown tahun otomatis update setiap tahun.
    const generateYears = () => {
        // Mendapatkan tahun saat ini (real-time).
        const currentYear = new Date().getFullYear();
        const years = [];
        // Loop untuk menambahkan tahun dari 5 tahun ke belakang hingga 5 tahun ke depan.
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years; // Mengembalikan array berisi angka-angka tahun.
    };

    // Bagian render komponen (JSX - sintaks mirip HTML dalam JavaScript).
    return (
        <div className="recap-container">
            <h2>Rekap Pemesanan Bulanan</h2>

            <div className="recap-form-section">
                {/* Grup input untuk memilih bulan */}
                <div className="form-group">
                    <label htmlFor="month-select">Pilih Bulan:</label>
                    <select
                        id="month-select"
                        value={month} // Nilai yang dipilih terikat ke state 'month'.
                        onChange={(e) => { setMonth(e.target.value); setMessage(''); }} // Update state 'month' saat ada perubahan.
                        className="recap-select"
                    >
                        <option value="">-- Pilih Bulan --</option>
                        {/* Memetakan array 'months' menjadi elemen <option> untuk dropdown. */}
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                {/* Grup input untuk memilih tahun */}
                <div className="form-group">
                    <label htmlFor="year-select">Pilih Tahun:</label>
                    <select
                        id="year-select"
                        value={year} // Nilai yang dipilih terikat ke state 'year'.
                        onChange={(e) => { setYear(e.target.value); setMessage(''); }} // Update state 'year' saat ada perubahan.
                        className="recap-select"
                    >
                        <option value="">-- Pilih Tahun --</option>
                        {/* Memanggil generateYears() untuk mendapatkan daftar tahun dinamis,
                            lalu memetakan menjadi elemen <option>. */}
                        {generateYears().map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Bagian tombol aksi */}
                <div className="recap-buttons">
                    <button onClick={handleGeneratePdf} className="recap-button primary">
                        Generate PDF Rekap
                    </button>
                    <button onClick={handleViewRecap} className="recap-button secondary">
                        Lihat Rekap
                    </button>
                </div>

                {/* Area untuk menampilkan pesan feedback kepada pengguna */}
                {/* Pesan hanya ditampilkan jika state 'message' tidak kosong. */}
                {message && (
                    <div className={`recap-message ${messageType}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recap;