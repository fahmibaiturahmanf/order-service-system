import React from "react"
import { useNavigate } from "react-router-dom"
import "./Minicompany.css"
import companyImage from "../../assets/companyprofile1.png"

const CompanyProfile = () => {
  const navigate = useNavigate();

  const handleSelengkapnya = () => {
    navigate("/tentangkami"); // ngarah ke halaman Tentang Kami
  };

  return (
    <div className="company-wrapper">
      <div className="company-box">
        <div className="company-text">
          <h2>PT. ECO METALINDO INDONESIA</h2>
          <p>
            PT. Eco Metalindo Indonesia adalah perusahaan berbentuk perseroan terbatas yang berlokasi di Bogor, Jawa Barat, Indonesia yang didirikan pada tanggal 27 Oktober 2020. 
            Perusahaan ini terdaftar dengan nomor bisnis 1123577 dan memiliki kantor di Bogor Center Point Blok C 12, Kota Bogor. 
            Perusahaan ini beroperasi di sektor manufaktur instalasi dan piping dengan menggunakan produk yang kami produksi. Sebagai perusahaan yang bergerak
            di sektor manufaktur, PT. Eco Metalindo Indonesia berfokus pada bidang instalasi dan piping,
            khususnya menggunakan produk FRP (Fiber Reinforced Plastic). 
            Dengan mengedepankan kualitas, efisiensi, dan kepuasan pelanggan, perusahaan terus berkomitmen
            untuk memberikan layanan terbaik pada klien.
          </p>
          <button onClick={handleSelengkapnya}>Selengkapnya</button>
        </div>
        <div className="company-img">
          <img src={companyImage} alt="Company" />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
