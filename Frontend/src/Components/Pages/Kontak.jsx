import React from 'react';
import './Kontak.css';
import kontak from '../../assets/kontak.png';
import { FaEnvelope, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

const Kontak = () => {
  return (
    <div
      className="kontak-container"
      style={{ backgroundImage: `url(${kontak})` }}
    >
      <div className="kontak-overlay">
        <h2 className="kontak-title">Kontak Kami</h2>
        <div className="kontak-items">
          <div className="kontak-item">
            <FaEnvelope className="kontak-icon" />
            <p className="kontak-label">ecometalindo@gmail.com</p>
          </div>
          <div className="kontak-item">
            <FaMapMarkerAlt className="kontak-icon" />
            <p className="kontak-label">
              Bogor Center Point <br />
              Blok C No.20, Cilendek Barat, Kec. Bogor Barat, Kota Bogor, <br />
              Jawa Barat 16112
            </p>
          </div>
          <div className="kontak-item">
            <FaUser className="kontak-icon" />
            <p className="kontak-label">081318604050</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
