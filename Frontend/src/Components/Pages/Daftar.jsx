import React, { useState } from 'react'
import axios from 'axios'
import './Daftar.css' 
import { useNavigate } from 'react-router-dom'

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
    displayName: '',
    fullAddress: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData); 

      setLoading(false);

      if (response.status === 201) {
        setSuccessMessage('Pendaftaran berhasil! Silakan login.');
        console.log('Pendaftaran berhasil:', response.data);
        setTimeout(() => {
          navigate('/akun'); 
        }, 2000);
      } else {
        setError(response.data?.message || 'Pendaftaran gagal. Terjadi kesalahan.');
        console.error('Pendaftaran gagal:', response);
      }
    } catch (error) {
      setLoading(false);
      setError('Koneksi gagal atau server error.');
      console.error('Error saat mendaftar:', error);
    }
  };

  return (
    <div className="daftar-container">
      <p className="judul-daftar">Daftar Akun</p>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
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
          pattern="[0-9]{10,15}"
          title="Nomor telepon harus 10 sampai 15 digit angka"
        />
        <input
          type="email"
          name="email"
          placeholder="Alamat Email Aktif"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="displayName"
          placeholder="Nama Pengguna"
          value={formData.displayName}
          onChange={handleChange}
          required
        />
        <textarea
          name="fullAddress"
          placeholder="Alamat Lengkap Pengguna"
          value={formData.fullAddress}
          onChange={handleChange}
          required
        />
        <div className="button-container">
          <button type="submit" disabled={loading} className="daftar-button">
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/akun')}
            className="daftar-back-button" 
          >
            Kembali ke Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;