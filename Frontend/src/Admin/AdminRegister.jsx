import React, { useState } from 'react'
import axios from 'axios'
import './AdminRegister.css'
import { useNavigate, Link } from 'react-router-dom'
import logoregisadmin from '../assets/logoregisadmin.png'

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    email: '',
    alamat: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validasi sederhana: pastikan semua field tidak kosong
    if (!formData.name || !formData.password || !formData.phone || !formData.email || !formData.alamat) {
      setError('Tolong isi dengan lengkap data diri admin');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/register',
        formData
      );

      setLoading(false);

      if (response.status === 201) {
        setSuccessMessage('Pendaftaran Admin berhasil! Silakan login.');
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setError('Server tidak dapat memproses permintaan saat ini.');
      }
    } catch (error) {
      setLoading(false);
      setError('Terjadi kesalahan server. Silakan coba lagi.');
    }
  };

  return (
    <div className="daftar-admin-container">
      <img src={logoregisadmin} alt="Admin Logo" className="admin-logo-static" />
      <p className="judul-daftar-admin">Daftar Admin EcoMetalindo</p>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nama Admin"
          value={formData.adminName}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="No. Telepon Aktif"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Alamat Email Aktif"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="alamat"
          placeholder="Alamat Lengkap Admin"
          value={formData.fullAddress}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>

        <Link to="/admin/login">
          <button type="button" style={{ marginTop: '10px' }}>
            Login
          </button>
        </Link>
        
      </form>
    </div>
  );
};

export default AdminRegister;