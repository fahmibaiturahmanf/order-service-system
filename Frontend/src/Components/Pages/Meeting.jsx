import React, { useState } from 'react';
import './Meeting.css';
import { FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import axios from 'axios';

const Meeting = () => {
    const [formData, setFormData] = useState({
        email: '',
        nama: '',
        alamat: '',
        telepon: '',
        pesan: '',
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/send-meeting-email', formData);
            setSuccessMessage('Pesan berhasil dikirim!');
            setFormData({ email: '', nama: '', alamat: '', telepon: '', pesan: '' });
        } catch (error) {
            console.error('Gagal mengirim email:', error);
            setErrorMessage('Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meeting-component-wrapper">
            <div className="meeting-container">
                <div className="meeting-left">
                    <p className="meeting-desc">
                        Terima kasih atas pemesanan Anda!
                        Silakan hubungi kami melalui salah satu kontak di bawah ini
                        untuk mengkonfirmasi jadwal meeting Anda sesuai tanggal yang sudah Anda tentukan pada formulir pemesanan.
                    </p>
                    <p className="meeting-desc small-text">
                        Pembayaran akan dilakukan setelah meeting.
                    </p>

                    <div className="meeting-buttons">
                        <a href="https://wa.me/6287884073268" target="_blank" rel="noopener noreferrer" className="meeting-button whatsapp">
                            <FaWhatsapp size={20} /> Whatsapp
                        </a>
                        <a 
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=212210032@student.ibik.ac.id&su=Permintaan%20Meeting&body=Halo%20tim%20Eco%20Metalindo%2C%0A%0ASaya%20ingin%20menjadwalkan%20meeting%20terkait%20pemesanan%20jasa.%0ATerima%20kasih."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="meeting-button email"
                        >
                        <FaEnvelope size={20} /> Gmail
                        </a>
                    </div>

                    <form className="meeting-form" onSubmit={handleSubmit}>
                        <h4>Atau tinggalkan pesan Anda:</h4>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="text"
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            placeholder="Nama"
                            required
                        />
                        <input
                            type="text"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            placeholder="Alamat"
                            required
                        />
                        <input
                            type="text"
                            name="telepon"
                            value={formData.telepon}
                            onChange={handleChange}
                            placeholder="No. Telepon"
                            required
                        />
                        <textarea
                            name="pesan"
                            value={formData.pesan}
                            onChange={handleChange}
                            placeholder="Pesan"
                            required
                        ></textarea>

                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Mengirim...' : 'Kirim'}
                        </button>

                        {successMessage && <p className="success-message">{successMessage}</p>}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </form>
                </div>

                <div className="meeting-right">
                    <div className="meeting-info-items">
                        <div className="meeting-info-item">
                            <FaUser className="meeting-info-icon" />
                            <p>081318604050</p>
                        </div>
                        <div className="meeting-info-item">
                            <FaMapMarkerAlt className="meeting-info-icon" />
                            <p>
                                Bogor Center Point <br />
                                Blok C No.20, Cilendek Barat, Kec. Bogor Barat, Kota Bogor, <br />
                                Jawa Barat 16112
                            </p>
                        </div>
                        <div className="meeting-info-item">
                            <FaEnvelope className="meeting-info-icon" />
                            <p>ecometalindo@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Meeting;
