import React, { useState } from 'react';
import './DirekturDaftar.css';
import { useNavigate, Link } from 'react-router-dom';
import logodirektur2 from '../assets/logodirektur2.png'; 

const DirekturDaftar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    email: '',
    alamat: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/direktur/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Gagal mendaftar');
        return;
      }

      setSuccessMsg('Pendaftaran berhasil! Silakan login.');
      setTimeout(() => navigate('/direktur/login-direktur'), 2000); // Arahkan setelah 2 detik

    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat menghubungi server');
      console.error(err);
    }
  };

  return (
    <div className="direktur-daftar-container">
      <img src={logodirektur2} alt="Direktur Logo" className="direktur-logo-static" />
      <p className="judul-direktur-daftar">Daftar Akun Direktur EcoMetalindo</p>
    
      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <form onSubmit={handleSubmit} className="direktur-daftar-form"> 
        <input
          type="text"
          name="name"
          placeholder="Nama Direktur"
          className="direktur-input-field"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="direktur-input-field"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="No. Telepon Aktif"
          className="direktur-input-field"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Alamat Email Aktif"
          className="direktur-input-field"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="alamat"
          placeholder="Alamat Lengkap Direktur"
          className="direktur-textarea-field"
          value={formData.alamat}
          onChange={handleChange}
          required
        />

        <button type="submit" className="direktur-daftar-button">
          Daftar
        </button>

        <Link to="/direktur/login-direktur">
          <button type="button" className="direktur-login-button-link">
            Login
          </button>
        </Link>
      </form>
    </div>
  );
};

export default DirekturDaftar;