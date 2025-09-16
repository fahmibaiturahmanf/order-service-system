import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance"; 
import "./Paymentorder.css";
import { getToken, clearSpecificAuthData } from '../../utils/auth';

const Paymentorder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [buktiBayar, setBuktiBayar] = useState(null);
    const [messageModal, setMessageModal] = useState({ show: false, title: "", message: "" });
    const { pemesananId, totalHarga, sisaTagihan, tipePembayaran } = location.state || {};
    const [paymentType, setPaymentType] = useState(tipePembayaran || "DP");
    const amountToPay = paymentType === "DP" ? totalHarga * 0.5 : sisaTagihan;
    const [nomorReferensi, setNomorReferensi] = useState("");

    useEffect(() => {
        const authToken = getToken('user');
        if (!authToken) {
            setMessageModal({
                show: true,
                title: "Sesi Berakhir",
                message: "Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan."
            });
            const timer = setTimeout(() => {
                navigate('/akun');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [navigate]);

    const handleCloseMessageModal = () => {
        if (messageModal.title === "Pembayaran Diterima!") {
            navigate("/profile");
        }
        setMessageModal({ show: false, title: "", message: "" });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            setMessageModal({
                show: true,
                title: "Format File Tidak Valid",
                message: "File yang diunggah harus berupa gambar (JPG, PNG, dll.) atau PDF."
            });
            event.target.value = null;
            setBuktiBayar(null);
            return;
        }
        setBuktiBayar(file);
    };

    const handlePayment = async () => {
        if (!buktiBayar) {
            setMessageModal({
                show: true,
                title: "Bukti Pembayaran Diperlukan",
                message: "Silakan unggah bukti pembayaran sebelum mengirim."
            });
            return;
        }

        if (!nomorReferensi.trim()) {
            setMessageModal({
                show: true,
                title: "Nomor Referensi Diperlukan",
                message: "Silakan isi nomor referensi dari bukti transfer Anda."
            });
            return;
        }

        const authToken = getToken('user');
        if (!authToken) {
            setMessageModal({
                show: true,
                title: "Sesi Berakhir",
                message: "Sesi Anda telah berakhir. Silakan login kembali."
            });
            clearSpecificAuthData('user');
            navigate('/akun');
            return;
        }

        const formData = new FormData();
        formData.append("pemesanan_id", pemesananId);
        formData.append("bukti_pembayaran", buktiBayar);
        formData.append("tipe_pembayaran", paymentType);
        formData.append("nomor_referensi", nomorReferensi);

        try {
            const responsePembayaran = await axios.post("http://localhost:5000/api/pembayaran/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            setMessageModal({
                show: true,
                title: "Pembayaran Diterima!",
                message: `Pembayaran ${paymentType} Anda telah diterima. Mohon tunggu validasi dari kami.`
            });

        } catch (error) {
            setMessageModal({
                show: true,
                title: "Kesalahan Pembayaran",
                message: `Terjadi kesalahan saat mengirim pembayaran: ${error.response?.data?.message || "Silakan coba lagi."}`
            });
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                clearSpecificAuthData('user');
                navigate('/akun');
            }
        }
    };

    if (!pemesananId) {
        return (
            <div className="po-payment-container">
                <p>Tidak ada data pesanan untuk pembayaran. Silakan kembali ke profil Anda.</p>
                <button onClick={() => navigate('/profile')}>Kembali ke Profil</button>
            </div>
        );
    }

    return (
        <div className="po-payment-container">
            <div className="po-title">Formulir Pembayaran {paymentType === "DP" ? "Down Payment" : "Pelunasan"}</div>
            <p>
            {paymentType === "DP"
                ? "Dimohon untuk melakukan transfer untuk pembayaran Down Payment (50%) terhadap jasa yang dipesan."
                : "Dimohon untuk melakukan transfer pelunasan terhadap jasa yang dipesan."}
            </p>
            <div className="po-virtual-box">
                <p><strong>Virtual Account:</strong></p>
                <p>BCA</p>
                <p>No.: 1234 5678 9012 3456</p>
                <p>Atas Nama: PT. Eco Metalindo Indonesia</p>
            </div>

            <div className="po-referensi-box">
                <label htmlFor="nomorReferensi">Nomor Referensi Transfer</label>
                <input
                    type="text"
                    id="nomorReferensi"
                    value={nomorReferensi}
                    onChange={(e) => setNomorReferensi(e.target.value)}
                    placeholder="Contoh: 1234567890"
                />
            </div>

            <div className="po-upload">
                <p>Unggah bukti bayar di sini</p>
                <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
            </div>

            <button className="po-submit-button" onClick={handlePayment} disabled={!buktiBayar}>Kirim Pembayaran</button>

            {messageModal.show && (
                <div className="po-modal-overlay">
                    <div className="po-modal-content">
                        <h3>{messageModal.title}</h3>
                        <p>{messageModal.message}</p>
                        <button className="po-modal-button" onClick={handleCloseMessageModal}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Paymentorder;
