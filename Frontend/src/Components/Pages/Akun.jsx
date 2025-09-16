import React, { useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './Akun.css';
import logologinfix from "../../assets/logologinfix.png";
import { useNavigate } from 'react-router-dom';
import { setAuthData } from '../../utils/auth';

const Akun = ({ onLoginSuccess, manualUpdateAuth }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const isLoadingRef = useRef(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (isLoadingRef.current) {
            console.warn("Akun.jsx: handleLogin dipanggil lagi saat sudah loading. Mencegah submit ganda.");
            return;
        }

        isLoadingRef.current = true;
        setIsButtonDisabled(true);
        setError('');

        try {
            console.log("Akun.jsx: Mengirim permintaan login POST /api/auth/login...");
            const response = await axiosInstance.post('/auth/login', { username, password });

            if (response.status === 200 && response.data.token && response.data.user) {
                const { token, user } = response.data;
                if (user.role !== 'user') {
                    setError('Akses ditolak. Silakan login melalui portal Admin/Direktur.');
                    return;
                }

                console.log('Akun.jsx: Menyimpan auth data.');
                setAuthData(token, user);

                localStorage.setItem('forceAuthRefresh', Date.now());
                if (manualUpdateAuth) manualUpdateAuth();

                setTimeout(() => {
                    if (onLoginSuccess) onLoginSuccess(user);
                    navigate('/profile');
                }, 500);

            } else {
                setError('Login gagal. Username atau password salah.');
            }
        } catch (error) {
            console.error("Akun.jsx: Error saat login:", error);
            setError('Username atau password salah.');
        } finally {
            setTimeout(() => {
                isLoadingRef.current = false;
                setIsButtonDisabled(false);
            }, 100);
        }
    };

    return (
        <div className="akun-container">
            <div className="login-box">
                <img src={logologinfix} alt="Eco Metalindo Indonesia" className="login-logo" />
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleLogin} className="login-form-content">
                    <input
                        type="text"
                        placeholder="Username"
                        className="input-field"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="forgot-password">
                        <span onClick={() => navigate('/resetpass')}>Lupa Password?</span>
                    </div>

                    <div className="button-group-akun">
                        <button type="button" className="tombol-reg" onClick={() => navigate('/daftar')}>Daftar</button>
                        <button type="submit" className="tombol-log" disabled={isButtonDisabled}>
                            {isButtonDisabled ? 'Masuk...' : 'Masuk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Akun;
