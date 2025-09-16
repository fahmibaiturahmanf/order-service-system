import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import './UpdateProfile.css';
import { getAuthStatus, getToken } from '../../utils/auth';

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    oldPassword: '',
    newPassword: '',
    oldPhone: '',
    newPhone: '',
    name: '',
    alamat: '',
    newEmail: '',
  });

  useEffect(() => {
    const authStatus = getAuthStatus('user');
    if (!authStatus.isAuthenticated || authStatus.userRole !== 'user') {
      console.warn('UpdateProfile: Token tidak valid atau bukan role user.');
      navigate('/akun', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    const token = getToken('user');
    if (!token) {
      alert('Token tidak ditemukan. Silakan login kembali.');
      navigate('/akun', { replace: true });
      return;
    }

    try {
      await axios.put('/auth/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Profil berhasil diperbarui!');
      navigate('/profile');
    } catch (error) {
      console.error('Gagal update profil:', error);
      alert(error?.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.');
    }
  };

  return (
    <div className="update-profile-container">
      <div className="update-title">Pembaruan Akun Profile</div>
      <form className="update-form">
        <input
          type="text"
          name="username"
          placeholder="Username Baru"
          value={formData.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="oldPassword"
          placeholder="Password Sebelumnya"
          value={formData.oldPassword}
          onChange={handleChange}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Password Baru"
          value={formData.newPassword}
          onChange={handleChange}
        />
        <input
          type="text"
          name="oldPhone"
          placeholder="No. Telepon Sebelumnya"
          value={formData.oldPhone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="newPhone"
          placeholder="No. Telepon Baru"
          value={formData.newPhone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Nama Pengguna"
          value={formData.name}
          onChange={handleChange}
        />
        <textarea
          name="alamat"
          placeholder="Alamat Lengkap Pengguna"
          rows="4"
          value={formData.alamat}
          onChange={handleChange}
        />
        <input
          type="email"
          name="newEmail"
          placeholder="Email Baru"
          value={formData.newEmail}
          onChange={handleChange}
        />
        <button type="button" onClick={handleUpdate}>
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
