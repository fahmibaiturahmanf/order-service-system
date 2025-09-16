import React from "react";
import "./Introduction.css";
import introduction from "../../assets/introduction.png";

const IntroductionSection = () => {
  return (
    <section className="introduction-section">
      <div className="intro-text">
        <h3>
          Kami Memberikan Jasa terbaik
          untuk anda Dalam Instalasi Dan Piping Non-Metal
        </h3>
        <p>
          Instalasi piping mencakup pemasangan sistem pipa yang terbuat dari
          material komposit berpenguat serat fiber yang diperkuat dengan resin
          polimer. Proses ini melibatkan pemotongan, penyambungan, dan
          pemasangan pipa FRP sesuai dengan desain sistem untuk mengalirkan
          berbagai jenis fluida dalam aplikasi industri, perairan, atau
          infrastruktur lainnya. Selain itu, instalasi pipa FRP juga melibatkan
          penggunaan fitting dan perlengkapan khusus untuk memastikan kekuatan,
          keandalan, dan ketahanan korosi sistem pipa yang dihasilkan.
        </p>
      </div>
      <div className="intro-image">
        <div className="image-frame">
          <img src={introduction} alt="introduction" />
        </div>
      </div>
    </section>
  );
};

export default IntroductionSection;
