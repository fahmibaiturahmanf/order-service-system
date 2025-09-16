import React, { useState, useEffect } from 'react'
import './Resetpassform.css'
import { useLocation, useNavigate } from 'react-router-dom'
import queryString from 'query-string'

function Resetpasswordform() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const parsed = queryString.parse(location.search);
    setToken(parsed.token || '');
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password berhasil direset. Anda akan dialihkan ke halaman login...');
        setTimeout(() => {
          navigate('/akun');
        }, 3000);
      } else {
        setError(data.error || 'Gagal mereset password.');
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan.');
      console.error('Error resetting password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="konten">
      <div className="kartu"> 
        <div className="banner">Atur Password Baru</div> 

        {token ? (
          <form onSubmit={handleSubmit}>
            <div className="kelompok">
              <label>Password Baru :</label>
              <input
                type="password"
                placeholder="Masukkan password baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="kelompok">
              <label>Konfirmasi Password Baru :</label>
              <input
                type="password"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="kirim-button" type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>

            {message && <p className="pesan-sukses">{message}</p>}
            {error && <p className="pesan-error">{error}</p>}
          </form>
        ) : (
          <p>Tautan reset password tidak valid atau tidak lengkap.</p>
        )}
      </div>
    </div>
  );
}

export default Resetpasswordform;