import React from 'react'
import './TentangKami.css'
import { FaCheckCircle, FaUserCog, FaDollarSign } from 'react-icons/fa'
import tentangkami1 from '../../assets/tentangkami1.png'
import tentangkami2 from '../../assets/tentangkami2.png'
import tentangkami3 from '../../assets/tentangkami3.png'
import tentangkami4 from '../../assets/tentangkami4.png'
import tentangkami5 from '../../assets/tentangkami5.png'
import tentangkami6 from '../../assets/tentangkami6.png'
import tentangkami7 from '../../assets/tentangkami7.png'
import tentangkami8 from '../../assets/tentangkami8.png'
import tentangkami9 from '../../assets/tentangkami9.png'

const TentangKami = () => {
  return (
    <>
      <div className="tentangkami-container">
        <div className="tentangkami-content">
          <div className="tentangkami-text">
            <h4>PT. ECO METALINDO INDONESIA</h4>
            <p className="subtitle">Jasa Instalasi dan Piping Non-Metal</p>
            <p className="description">
              PT. Eco Metalindo Indonesia didirikan pada tahun 2020 oleh Eko Saputra dan Beni nuryanto.
              Perusahaan ini beralamat di Bogor Center Point, Block C No.20, Kota Bogor, Jawa Barat, Indonesia
              dan memiliki workshop di daerah Tangerang. PT. Eco Metalindo Indonesia didirikan untuk memberikan
              solusi terbaik dalam dunia instalasi ini. Sebagai perusahaan yang bergerak dibidang jasa instalasi dan
              piping non-metal, kami berkomitmen untuk memberikan layanan berkualitas tinggi sesuai dengan kebutuhan
              industri modern.
            </p>
          </div>
          <div className="tentangkami-old-images">
            <div className="old-image-grid">
              <div className="old-left-column">
                <img src={tentangkami1} alt="Tentangkami1" className="img-tall" />
                <img src={tentangkami2} alt="Tentangkami2" className="img-short" />
              </div>
              <div className="old-right-column">
                <img src={tentangkami4} alt="Tentangkami4" className="img-tall" />
                <img src={tentangkami3} alt="Tentangkami3" className="img-short" />
              </div>
            </div>
          </div>
        </div>

        <div className="fitur-container">
          <div className="fitur-box">
            <FaCheckCircle className="fitur-icon" />
            <p>
              Kualitas produk terjamin karena menggunakan bahan dasar FRP sehingga produk tahan di segala kondisi.
            </p>
          </div>
          <div className="fitur-box">
            <FaUserCog className="fitur-icon" />
            <p>
              Kami melayani dengan baik agar kebutuhan pengguna dapat dimaksimalkan secara penuh.
            </p>
          </div>
          <div className="fitur-box">
            <FaDollarSign className="fitur-icon" />
            <p>
              Menyediakan jasa dengan harga kompetitif namun disesuaikan ke efisiensinya.
            </p>
          </div>
        </div>

        <div className="visimisi-wrapper">
          <div className="visimisi-grid">
            <div className="visimisi-left">
              <img src={tentangkami5} alt="gambar besar 1" />
            </div>
            <div className="visimisi-right">
              <img src={tentangkami6} alt="gambar kecil 1" />
              <img src={tentangkami7} alt="gambar kecil 2" />
              <img src={tentangkami8} alt="gambar kecil 3" />
              <img src={tentangkami9} alt="gambar kecil 4" />
            </div>
          </div>

          <p className="visimisi-text">
            <strong>Visi:</strong> Menjadi perusahaan yang unggul dan terdepan di bidang penyedia barang dan jasa.<br />
            <strong>Misi:</strong> Memberikan pelayanan jasa terbaik secara profesional, sistematik dan teknologi yang berintegrasi,
            selalu mengutamakan kepuasan pelanggan, berkomitmen penuh untuk memberi solusi total terhadap pelanggan menjadi
            perusahaan beretika rasional.
          </p>
        </div>
      </div>
    </>
  );
};

export default TentangKami