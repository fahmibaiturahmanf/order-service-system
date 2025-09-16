import React, { useState } from 'react';
import './DirekturLogin.css';
import { useNavigate, useLocation } from 'react-router-dom'; 
import logodirektur from '../assets/logodirektur.png';
import { setAuthData, clearAllAuthData } from '../utils/auth'; 

const DirekturLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const from = location.state?.from || '/direktur/dashboard'; 

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            console.log("DirekturLogin: Mengirim permintaan login untuk Direktur.");
            const res = await fetch('http://localhost:5000/api/direktur/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            console.log("DirekturLogin: Respon backend:", data);

            if (!res.ok) {
                setErrorMsg(data.message || 'Gagal login. Username atau password salah.');
                console.error("DirekturLogin: Login gagal dari server:", data);
                return;
            }

            if (data.token && data.user && data.user.role === 'direktur') {
                setAuthData(data.token, data.user); 
                console.log('DirekturLogin: Token direktur valid dan data tersimpan.');

                if (onLoginSuccess) onLoginSuccess('direktur');
                navigate(from, { replace: true });
            } else {
                console.warn('DirekturLogin: Token tidak valid atau role bukan direktur dari respons backend.');
                clearAllAuthData();
                setErrorMsg('Autentikasi gagal: Role tidak sesuai atau data tidak lengkap.');
            }

        } catch (err) {
            setErrorMsg('Terjadi kesalahan koneksi. Pastikan backend berjalan.');
            console.error('DirekturLogin: Kesalahan koneksi:', err);
            clearAllAuthData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="direktur-login-container">
            <div className="direktur-login-box">
                <img src={logodirektur} alt="EcoMetalindo Logo" className="direktur-logo-static" />
                <div className="direktur-login-title">Login Direktur</div>
                {errorMsg && <div className="error-message">{errorMsg}</div>}
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="Username"
                        className="direktur-input-field"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="direktur-input-field"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button className="direktur-login-button" type="submit" disabled={loading}>
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>
                    <button
                        className="direktur-register-button-link"
                        onClick={() => navigate('/direktur/register')}
                        type="button"
                    >
                        Daftar Direktur
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DirekturLogin;
