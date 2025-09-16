import React, { useState, useEffect } from 'react';
import './ProfileDirektur.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

import { getToken, getUserData, clearAllAuthData } from '../../utils/auth';

function ProfileDirektur() {
  const [direkturData, setDirekturData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken('direktur');
      const user = getUserData('direktur');

      if (!token || !user || user.role !== 'direktur') {
        console.error("ERROR - ProfileDirektur: Tidak ada token direktur yang valid atau role tidak cocok di useEffect.");
        clearAllAuthData(); // Tetap bersihkan
        // TEMPORARY: Komentari baris navigate ini untuk debugging
        // navigate('/direktur/login');
        setDirekturData(null); // Atur ke null
        setLoading(false); // Pastikan loading selesai
        return;
      }

      setDirekturData(user); // Tampilkan data dari localStorage dulu

      try {
        const response = await axios
          .get('http://localhost:5000/api/direktur/profile', { // Pastikan endpoint benar
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        setDirekturData(response.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("ERROR - ProfileDirektur: Gagal mengambil data profil dari API:", err);

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.error("ERROR - ProfileDirektur: Token direktur tidak valid atau kadaluarsa dari API. Membersihkan data.");
          clearAllAuthData(); // Tetap bersihkan
          // TEMPORARY: Komentari baris navigate ini untuk debugging
          // navigate('/direktur/login');
        } else {
          setError('Gagal mengambil data profil direktur. Terjadi kesalahan jaringan atau server.');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    console.log("ProfileDirektur: Logout direktur dipicu.");
    clearAllAuthData();
    // TEMPORARY: Komentari baris navigate ini untuk debugging
    // navigate('/direktur/login');
    window.location.reload(); // Opsi darurat jika tidak navigate
  };

  if (loading) {
    return <div className="direktur-profile-container">Loading profil direktur...</div>;
  }

  if (error) {
    return <div className="direktur-profile-container">Error: {error}</div>;
  }

  if (!direkturData) {
    return (
        <div className="direktur-profile-container" style={{ padding: '20px', color: 'red', fontSize: '1.2em' }}>
            Data profil direktur tidak ditemukan atau sesi tidak valid.
            Cek console untuk detail lebih lanjut.
        </div>
    );
  }

  return (
    <div className="direktur-profile-container">
      <div className="profile-header">
        <h1>Profil Direktur</h1>
      </div>
      <div className="profile-body">
        <div className="profile-info-card">
          <div className="profile-avatar">
            <div className="avatar-icon">
              {direkturData.name ? direkturData.name[0].toUpperCase() : 'D'}
            </div>
          </div>
          <div className="profile-details">
            <p><span className="info-icon">👤</span> <strong>Nama:</strong> {direkturData.name}</p>
            <p><span className="info-icon">📧</span> <strong>Email:</strong> {direkturData.email}</p>
            {direkturData.username && (
              <p><span className="info-icon">🆔</span> <strong>Username:</strong> {direkturData.username}</p>
            )}
            <p><span className="info-icon">🔑</span> <strong>ID:</strong> {direkturData._id}</p>

            {direkturData.alamat && (
              <p><span className="info-icon">🏠</span> <strong>Alamat:</strong> {direkturData.alamat}</p>
            )}
            {direkturData.phone && (
              <p><span className="info-icon">📞</span> <strong>No. Telepon:</strong> {direkturData.phone}</p>
            )}
            {direkturData.role && (
              <p><span className="info-icon">💼</span> <strong>Role:</strong> {direkturData.role}</p>
            )}
          </div>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileDirektur;
