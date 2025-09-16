import React, { useState, useEffect } from 'react';
import './AdminProfile.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { getAuthStatus, clearSpecificAuthData } from '../../utils/auth';

function AdminProfile() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("AdminProfile.jsx: Memverifikasi status otentikasi admin.");
        const authStatus = getAuthStatus('admin');

        if (authStatus.isAuthenticated && authStatus.userRole === 'admin' && authStatus.userData) {
            setAdminData(authStatus.userData);
            console.log("AdminProfile.jsx: Pengguna terotentikasi sebagai admin:", authStatus.userData);
        } else {
            console.warn("AdminProfile.jsx: Pengguna tidak terotentikasi atau data tidak valid.");
            clearSpecificAuthData('admin');
            navigate('/admin/login', { replace: true });
            setLoading(false);
            return;
        }

        // Ambil data profil terbaru dari backend
        axiosInstance
            .get('/admin/profile')
            .then((response) => {
                setAdminData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                console.error("AdminProfile: Gagal mengambil data profile:", err);

                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    console.error("AdminProfile: Token admin tidak valid atau kadaluarsa.");
                    clearSpecificAuthData('admin');
                    navigate('/admin/login', { replace: true });
                } else {
                    setError('Gagal mengambil data profile.');
                }
            });
    }, [navigate]);

    const handleLogout = () => {
        console.log("AdminProfile: Logout admin dipicu.");
        clearSpecificAuthData('admin');
        navigate('/admin/login', { replace: true });
    };

    if (loading) {
        return <div className="admin-profile-container">Memuat profil...</div>;
    }

    if (error) {
        return <div className="admin-profile-container">Error: {error}</div>;
    }

    if (!adminData) {
        return (
            <div className="admin-profile-container" style={{ padding: '20px', color: 'red', fontSize: '1.2em' }}>
                Data profil admin tidak ditemukan atau sesi tidak valid. Cek console untuk detail.
            </div>
        );
    }

    return (
        <div className="admin-profile-container">
            <div className="profile-header">
                <h1>Profil Admin</h1>
            </div>
            <div className="profile-body">
                <div className="profile-info-card">
                    <div className="profile-avatar">
                        <div className="avatar-icon">
                            {adminData.name ? adminData.name[0] : 'A'}
                        </div>
                    </div>
                    <div className="profile-details">
                        <p><span className="info-icon">👤</span> <strong>Nama:</strong> {adminData.name}</p>
                        <p><span className="info-icon">✉️</span> <strong>Email:</strong> {adminData.email}</p>
                        <p><span className="info-icon">🆔</span> <strong>ID:</strong> {adminData._id}</p>
                        {adminData.alamat && (
                            <p><span className="info-icon">🏠</span> <strong>Alamat:</strong> {adminData.alamat}</p>
                        )}
                        {adminData.phone && (
                            <p><span className="info-icon">📞</span> <strong>No. Telepon:</strong> {adminData.phone}</p>
                        )}
                        {adminData.role && (
                            <p><span className="info-icon">💼</span> <strong>Role:</strong> {adminData.role}</p>
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

export default AdminProfile;
