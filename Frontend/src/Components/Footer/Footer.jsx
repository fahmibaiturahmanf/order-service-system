import React, { useEffect, useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import logofooter2 from "../../assets/logofooter2.png";
import { getAuthStatus } from '../../utils/auth';

const Footer = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const auth = getAuthStatus();
    setIsUserLoggedIn(auth?.userData && auth?.currentAuthRole === 'user');

    const handleAuthChange = () => {
      const updatedAuth = getAuthStatus();
      setIsUserLoggedIn(updatedAuth?.userData && updatedAuth?.currentAuthRole === 'user');
    };

    window.addEventListener('authDataChanged', handleAuthChange);
    return () => window.removeEventListener('authDataChanged', handleAuthChange);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-left">
        <img src={logofooter2} alt="Logo Eco Metalindo" className="footer-logo" />
        <p className="footer-description">
          Jasa Instalasi Dan Piping Non-Metal <br />
          Menggunakan produk yang kami produksi <br />
          Dengan Berbahan Material FRP <br />
          (Fiber Reinforced Plastic)
        </p>
      </div>

      <div className="footer-right">
        {isUserLoggedIn ? (
          <Link to="/profile">Profil</Link>
        ) : (
          <Link to="/akun">Akun</Link>
        )}
        <Link to="/tentangkami">Tentang Kami</Link>
        <Link to="/">Beranda</Link>
        <Link to="/jasa">Jasa</Link>
        <Link to="/kontak">Kontak</Link>
      </div>
    </footer>
  );
};

export default Footer;
