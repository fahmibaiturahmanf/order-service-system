import React, { useState } from 'react'
import './Resetpass.css'
import logoresetpass from '../../assets/logoresetpass.png'
import { useNavigate } from 'react-router-dom'

function Resetpass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password-request', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Tautan reset password telah dikirim ke email Anda.');
      } else {
        setError(data.error || 'Gagal mengirim permintaan reset password.');
      }
    } catch (error) {
      setError('Terjadi kesalahan jaringan.');
      console.error('Error requesting reset:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="konten">
      <div className="kartu">
        <img src={logoresetpass} alt="img-resetpass" className="reset-logo" />

        <div className="banner">Lupa Password?</div> 
        <p>Masukkan alamat email Anda untuk menerima tautan reset password.</p> 

        <div className="kelompok">
          <label>Email :</label>
          <input
            type="email"
            placeholder="Masukkan email anda"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="kirim-button" onClick={handleRequestReset} disabled={loading}>
          {loading ? 'Mengirim...' : 'Kirim Tautan Reset'} 
        </button>

        {message && <p className="pesan-sukses">{message}</p>}
        {error && <p className="pesan-error">{error}</p>}
      </div>
    </div>
  );
}

export default Resetpass;