import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance'; 
import './AdminLogin.css';
import { useNavigate } from 'react-router-dom';
import logoadminlog from '../../src/assets/logoadminlog.png';
import { setAuthData } from '../utils/auth'; 

const AdminLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate(); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault(); 
        
        if (loading) {
            console.log("AdminLogin: handleLogin dipanggil saat loading, mengabaikan.");
            return; 
        }

        setLoading(true);
        setError('');
        console.log("AdminLogin: Memulai proses handleLogin.");

        try {
            console.log('AdminLogin: Mengirim data login POST /admin/login...');
            const response = await axiosInstance.post('/admin/login', {
                username,
                password,
            });

            console.log("AdminLogin: Respon dari backend diterima. Status:", response.status);

            if (response.status === 200 && response.data.token && response.data.user) {
                const { token, user } = response.data;
                console.log("AdminLogin: Login berhasil. Data pengguna dari backend:", user);

                const userRole = user?.role;
                if (userRole !== 'admin') {
                    console.warn(`AdminLogin: Role user bukan admin ('${userRole}'). Membatalkan login.`);
                    setError('Akses ditolak. Silakan login melalui portal yang sesuai.');
                    setLoading(false);
                    return;
                }
                
                console.log('AdminLogin: Memanggil setAuthData untuk menyimpan token dan user.');
                setAuthData(token, user); // setAuthData akan memicu event 'authDataChanged'
                console.log('AdminLogin: setAuthData selesai. Memanggil onLoginSuccess untuk navigasi.');

                if (onLoginSuccess) onLoginSuccess(userRole); // Teruskan role agar App.jsx bisa menavigasi dengan benar
                // HAPUS navigate('/admin/dashboardhome'); jika ada di sini!
            } else {
                setError(response.data?.message || 'Login gagal. Email atau password salah.');
                console.error("AdminLogin: Login gagal: Status bukan 200 atau data tidak lengkap.", response.data);
            }
        } catch (error) {
            console.error('AdminLogin: Error saat login:', error);
            if (error.response) {
                console.error("AdminLogin: Respon error dari server:", error.response.data);
                setError(error.response.data.message || 'Email atau password salah.');
            } else {
                setError('Koneksi gagal atau server error. Pastikan backend berjalan.');
            }
        } finally {
            setLoading(false);
            console.log("AdminLogin: Proses handleLogin selesai. loading diset ke false.");
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <img src={logoadminlog} alt="Admin Logo" className="admin-logo-static" />
                <div className="admin-login-title">Login Admin</div>
                {error && <p className="admin-error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="admin-input-field"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="admin-input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <button className="admin-masuk-button" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Masuk'}
                    </button>
                </form>
                <button
                    className="admin-daftar-button"
                    onClick={() => navigate('/admin/register')}
                    type="button" 
                >
                    Daftar Admin
                </button>
            </div>
        </div>
    );
};

export default AdminLogin;