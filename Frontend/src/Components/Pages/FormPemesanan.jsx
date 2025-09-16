import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Formpemesanan.css';
import axios from "../../utils/axiosInstance";
import { getUserData, getToken, clearSpecificAuthData, getAuthStatus } from '../../utils/auth';

// Mendefinisikan komponen fungsional React bernama FormPemesanan.
const FormPemesanan = () => {
    // Menginisialisasi hook useNavigate untuk mendapatkan fungsi navigasi.
    const navigate = useNavigate();

    // === Form states ===
    // State untuk menyimpan input nama pelanggan. Awalnya kosong.
    const [nama, setNama] = useState("");
    // State untuk email pelanggan.
    const [email, setEmail] = useState("");
    // State untuk nomor telepon pelanggan.
    const [no_telepon, setNoTelepon] = useState("");
    // State untuk alamat pelanggan.
    const [alamat, setAlamat] = useState("");
    // State untuk tanggal kick-off meeting yang dipilih pelanggan.
    const [tanggal_kickoff, setTanggalKickoff] = useState("");
    // State untuk jenis jasa yang dipilih. Akan menyimpan nama jasa.
    const [jenis_jasa, setJenisJasa] = useState("");
    // State untuk harga jasa yang dipilih. Awalnya 0.
    const [hargaJasa, setHargaJasa] = useState(0);

    // State untuk menyimpan daftar jasa yang diambil dari backend. Awalnya array kosong.
    const [daftarJasa, setDaftarJasa] = useState([]);

    // State untuk indikator loading (saat data sedang dimuat atau proses). Awalnya true.
    const [loading, setLoading] = useState(true);
    // State untuk menyimpan pesan error jika terjadi kesalahan. Awalnya null.
    const [error, setError] = useState(null);
    // State untuk menampilkan/menyembunyikan modal pop-up. Awalnya false.
    const [showModal, setShowModal] = useState(false);
    // State untuk menyimpan pesan yang akan ditampilkan di modal.
    const [modalMessage, setModalMessage] = useState("");
    // State untuk menyimpan data pemesanan setelah berhasil dikirim,
    // yang akan digunakan untuk navigasi ke halaman berikutnya.
    const [pemesananDataUntukNavigasi, setPemesananDataUntukNavigasi] = useState(null);

    // useEffect hook: Berjalan setelah render pertama komponen.
    // Digunakan untuk validasi autentikasi dan mengambil daftar jasa dari backend.
    useEffect(() => {
        // Mendapatkan status autentikasi pengguna dari utilitas auth.js.
        const authStatus = getAuthStatus('user');
        
        // Memeriksa apakah pengguna tidak terautentikasi, bukan role 'user', atau data user tidak ada.
        if (!authStatus.isAuthenticated || authStatus.userRole !== 'user' || !authStatus.userData) {
            // Jika tidak valid, hapus data autentikasi user dan arahkan ke halaman login/akun.
            clearSpecificAuthData('user');
            navigate('/akun', { replace: true }); // replace: true agar tidak bisa kembali ke halaman ini dengan tombol back.
            return; // Hentikan eksekusi useEffect lebih lanjut.
        }

        // Jika autentikasi valid, ambil data pengguna dari status autentikasi.
        const userData = authStatus.userData;
        // Mengisi state form dengan data pengguna yang sudah login (field readOnly).
        setNama(userData.name || '');
        setEmail(userData.email || '');
        setNoTelepon(userData.phone || '');
        setAlamat(userData.alamat || '');

        // Fungsi asinkron untuk mengambil daftar jasa dari backend.
        const fetchJasa = async () => {
            try {
                // Melakukan permintaan GET ke endpoint API jasa-user.
                const response = await axios.get("http://localhost:5000/api/jasa-user");
                // Setelah berhasil, simpan data jasa ke state daftarJasa.
                setDaftarJasa(response.data);
            } catch (err) {
                // Tangani error jika gagal memuat jasa.
                console.error("Gagal memuat jasa:", err.message);
                setError("Gagal memuat daftar jasa.");
            } finally {
                // Apapun hasilnya (berhasil/gagal), set loading menjadi false.
                setLoading(false);
            }
        };

        // Panggil fungsi fetchJasa saat komponen pertama kali dimuat.
        fetchJasa();
    }, [navigate]); // Array dependensi kosong, kecuali 'navigate' karena digunakan di dalam efek.
                    // Efek ini cuman berjalan sekali setelah render pertama,
                    // atau jika 'navigate' berubah (meskipun navigate biasanya stabil).

    // Fungsi untuk menangani perubahan pilihan jasa di dropdown.
    const handleJasaChange = (e) => {
        // Ambil nilai (ID jasa) dari opsi yang dipilih.
        const selectedId = e.target.value;
        // Cari objek jasa yang sesuai di dalam daftarJasa berdasarkan ID.
        const jasaTerpilih = daftarJasa.find(j => j._id === selectedId);
        
        if (jasaTerpilih) {
            // Jika jasa ditemukan, set jenis jasa dan harganya ke state.
            setJenisJasa(jasaTerpilih.nama_jasa);
            setHargaJasa(jasaTerpilih.harga_jasa);
        } else {
            // Jika tidak ada jasa terpilih (misal opsi default), reset state.
            setJenisJasa("");
            setHargaJasa(0);
        }
    };

    // Fungsi untuk menampilkan modal kustom dengan pesan dan data pemesanan.
    const showCustomModal = (message, dataPemesanan) => {
        setModalMessage(message); // Set pesan modal.
        setPemesananDataUntukNavigasi(dataPemesanan); // Simpan data pemesanan untuk navigasi setelah modal ditutup.
        setShowModal(true); // Tampilkan modal.
    };

    // Fungsi untuk menutup modal dan melakukan navigasi jika ada data pemesanan.
    const handleCloseModal = () => {
        setShowModal(false); // Sembunyikan modal.
        if (pemesananDataUntukNavigasi) {
            // Jika ada data pemesanan yang disimpan, navigasi ke halaman '/meeting'.
            // Mengirimkan state melalui navigate untuk membawa data penting ke halaman meeting.
            navigate("/meeting", {
                state: {
                    pemesananId: pemesananDataUntukNavigasi._id,
                    jenisJasa: pemesananDataUntukNavigasi.jenis_jasa,
                    tanggalKickoff: pemesananDataUntukNavigasi.tanggal_kickoff,
                }
            });
        }
    };

    // Fungsi asinkron untuk menangani pengiriman form pemesanan.
    const handleSubmit = async (e) => {
        e.preventDefault(); // Mencegah perilaku default form (reload halaman).
        setError(null); // Reset error sebelumnya.
        setLoading(true); // Tampilkan indikator loading.

        // Ambil token autentikasi pengguna.
        const token = getToken('user');
        if (!token) {
            // Jika token tidak ada, beri peringatan dan arahkan ke halaman login.
            alert("Sesi Anda telah berakhir. Silakan login kembali.");
            clearSpecificAuthData('user');
            navigate('/akun', { replace: true });
            setLoading(false);
            return;
        }

        // Buat objek data yang akan dikirim ke backend.
        const data = {
            nama,
            email,
            no_telepon,
            alamat,
            tanggal_kickoff,
            jenis_jasa,
            harga_jasa: hargaJasa,
        };

        try {
            // Lakukan permintaan POST ke backend untuk membuat pesanan baru.
            const res = await axios.post("http://localhost:5000/api/user-pemesanan/create-order", data, {
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`, // Kirim token untuk otorisasi.
                },
            });

            // Ambil data pemesanan dari respons backend.
            const pemesanan = res.data.pemesanan;
            // Validasi apakah ID pemesanan diterima.
            if (!pemesanan || !pemesanan._id) {
                alert("Terjadi kesalahan! ID pemesanan tidak ditemukan.");
                setLoading(false);
                return;
            }

            // Tampilkan modal sukses dengan pesan dan data pemesanan.
            showCustomModal("Pemesanan terkirim! Silakan lanjutkan untuk menjadwalkan meeting.", pemesanan);
        } catch (err) {
            // Tangani error jika terjadi kesalahan saat mengirim pesanan.
            console.error("Error pemesanan:", err);
            // Ambil pesan error dari respons backend atau gunakan pesan default.
            const msg = err.response?.data?.message || "Terjadi kesalahan saat mengirim pesanan.";
            setError(msg); // Set pesan error di state.
            alert(`Terjadi kesalahan: ${msg}`); // Tampilkan alert.

            // Jika error adalah 401 (Unauthorized) atau 403 (Forbidden),
            // berarti token tidak valid, arahkan pengguna untuk login ulang.
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                clearSpecificAuthData('user');
                navigate('/akun', { replace: true });
            }
        } finally {
            setLoading(false); // Sembunyikan indikator loading.
        }
    };

    // Kondisional rendering: Jika loading true, tampilkan pesan loading.
    if (loading) return <div className="form-loading">Memuat formulir...</div>;

    // Bagian render komponen (JSX - sintaks mirip HTML dalam JavaScript).
    return (
        <div className="form-container">
            <h2 className="form-title">Formulir Pemesanan</h2>
            <form onSubmit={handleSubmit}> {/* Ketika form disubmit, panggil handleSubmit */}
                {/* Bagian input Nama (readOnly, diambil dari data user) */}
                <div className="form-row">
                    <label>Nama :</label>
                    <input type="text" value={nama} readOnly required />
                </div>

                {/* Bagian input Email (readOnly, diambil dari data user) */}
                <div className="form-row">
                    <label>Email :</label>
                    <input type="email" value={email} readOnly required />
                </div>

                {/* Bagian input No. Telepon (readOnly, diambil dari data user) */}
                <div className="form-row">
                    <label>No. Telepon :</label>
                    <input type="tel" value={no_telepon} readOnly required />
                </div>

                {/* Bagian input Alamat (readOnly, diambil dari data user) */}
                <div className="form-row">
                    <label>Alamat :</label>
                    <textarea value={alamat} readOnly required></textarea>
                </div>

                {/* Bagian input Tanggal Kick Off Meet (bisa diisi user) */}
                <div className="form-row">
                    <label>Tanggal Pertemuan Meeting :</label>
                    <input
                        type="date"
                        value={tanggal_kickoff}
                        onChange={(e) => setTanggalKickoff(e.target.value)} // Update state saat nilai berubah
                        required
                    />
                </div>

                {/* Bagian dropdown Jasa yang dipesan (dari backend) */}
                <div className="form-row">
                    <label>Jasa yang dipesan :</label>
                    <select onChange={handleJasaChange} required defaultValue=""> {/* Panggil handleJasaChange saat pilihan berubah */}
                        <option disabled value="">Pilih jasa</option> {/* Opsi default yang tidak bisa dipilih */}
                        {/* Loop melalui daftarJasa untuk membuat opsi dropdown */}
                        {daftarJasa.map((jasa) => (
                            <option key={jasa._id} value={jasa._id}>
                                {jasa.nama_jasa}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bagian tampilan Total Harga Jasa (otomatis terisi) */}
                <div className="form-row">
                    <label>Total Harga Jasa:</label>
                    {/* Menampilkan harga dengan format mata uang Rupiah Indonesia */}
                    <p><strong>Rp.{hargaJasa.toLocaleString('id-ID')}</strong></p>
                </div>

                {/* Tombol untuk mengirim form */}
                <div className="form-send-button">
                    <button type="submit" className="form-submit-button">Selanjutnya</button>
                </div>
            </form>

            {/* Modal Pop-up: Hanya ditampilkan jika showModal bernilai true */}
            {showModal && (
                <div className="modal-overlay"> {/* Overlay untuk menutupi background */}
                    <div className="modal-content"> {/* Konten modal */}
                        <h3>Pemberitahuan</h3>
                        <p>{modalMessage}</p> {/* Pesan yang ditampilkan di modal */}
                        <button onClick={handleCloseModal} className="modal-button">OK</button> {/* Tombol untuk menutup modal */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormPemesanan;
