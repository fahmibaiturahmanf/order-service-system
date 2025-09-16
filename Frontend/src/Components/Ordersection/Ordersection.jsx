import React from 'react';
import './Ordersection.css';
import orderbackground from '../../assets/orderbackground.png';
import worker from '../../assets/worker.png';
import { useNavigate } from 'react-router-dom';

const Ordersection = () => {
  const navigate = useNavigate();

  const handlePesanSekarang = () => {
    const token = localStorage.getItem('authToken');

    if (token) {
      navigate('/formpemesanan');
    } else {
      alert('Silakan login terlebih dahulu untuk memesan.');
      navigate('/akun');
    }
  };

  return (
    <div className="order-section1">
      <div
        className="order-background"
        style={{ backgroundImage: `url(${orderbackground})` }}
      />
      <div className="order-overlay" />
      <div className="order-content">
        <div className="order-left">
          <img src={worker} alt="Pekerja" />
        </div>
        <div className="order-right">
          <h2>Dapatkan Harga Terbaik</h2>
          <p>Dari kami</p>
          <button onClick={handlePesanSekarang}>Pesan Sekarang</button>
        </div>
      </div>
    </div>
  );
};

export default Ordersection;
