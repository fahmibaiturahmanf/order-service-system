import React, { useEffect, useState } from 'react';
import './Jasa.css'; 
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth'; 
import axios from 'axios';

// Gambar statis
import jasa1 from "../../assets/jasa1.png";
import jasa2 from "../../assets/jasa2.png";
import jasa3 from "../../assets/jasa3.png";
import jasa4 from "../../assets/jasa4.png";
import jasa5 from "../../assets/jasa5.png";
import jasa6 from "../../assets/jasa6.png";
import jasa7 from "../../assets/jasa7.png";
import jasa8 from "../../assets/jasa8.png";
import jasa9 from "../../assets/jasa9.png";

const Jasa = () => {
  const navigate = useNavigate();
  const [jasaFromBackend, setJasaFromBackend] = useState([]);
  const [loading, setLoading] = useState(true);

  const gambarList = [jasa1, jasa2, jasa3, jasa4, jasa5, jasa6, jasa7, jasa8, jasa9];

  const fetchJasa = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jasa-user');
      setJasaFromBackend(res.data);
    } catch (error) {
      console.error('Gagal mengambil jasa dari backend:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJasa();
  }, []);

  const handlePesanSekarang = () => {
    const token = getToken(); 
    if (token) {
      navigate('/formpemesanan');
    } else {
      alert('Silakan login terlebih dahulu untuk memesan.');
      navigate('/akun');
    }
  };

  return (
    <div className="jasa-container">
      {/* Header */}
      <div className="jasa-header">
        <div className="jasa-heading">
          <p className="sub-title">Pelayanan Kami</p>
          <h1 className="main-title">Instalasi Dan Piping</h1>
          <p className="desc">
            Menawarkan jasa untuk Pemasangan dari produk Pipa FRP yang kami Produksi
          </p>
        </div>
      </div>

      {/* Tombol pesan atas */}
      <div className="tombol-mesen1">
        <button className="btn-pesan" onClick={handlePesanSekarang}>Pesan Sekarang</button>
      </div>

      {/* Jasa dari backend + gambar statis */}
      {loading ? (
        <p>Memuat data jasa...</p>
      ) : jasaFromBackend.length > 0 ? (
        jasaFromBackend.map((item, index) => (
          <div className="jasa-card" key={item._id}>
            <img
              src={gambarList[index % gambarList.length]}
              alt={`Gambar Jasa ${index + 1}`}
              className="jasa-image"
            />
            <div className="jasa-text">
              <h3 className="jasa-title">{item.nama_jasa}</h3>
              <p className="jasa-desc">{item.deskripsi_jasa}</p>
              <p className="jasa-info">
                Alat dan Bahan: {item.alat_dan_bahan || 'tbc'} <br />
                Waktu Pengerjaan: {item.durasi_jasa || 'tbc'} <br />
                Harga: Rp {item.harga_jasa?.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>Belum ada data jasa tersedia.</p>
      )}

      {/* Tombol pesan bawah */}
      <div className="tombol-mesen2">
        <button className="btn-pesan" onClick={handlePesanSekarang}>Pesan Sekarang</button>
      </div>
    </div>
  );
};

export default Jasa;
