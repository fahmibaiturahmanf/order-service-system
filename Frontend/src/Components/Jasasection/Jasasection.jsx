import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Jasasection.css'

import pipafrp from '../../assets/pipafrp.png'
import pipahdpe from '../../assets/pipahdpe.png'
import pipapvdf from '../../assets/pipapvdf.png'
import pipapp from '../../assets/pipapp.png'
import frpcabletray from '../../assets/frpcabletray.png'
import frpcableladder from '../../assets/frpcableladder.png'
import frpmoulded from '../../assets/frpmoulded.png'
import tankectfe from '../../assets/tankectfe.png'
import liningfrp from '../../assets/liningfrp.png'

const jasaList = [
  { id: 1, title: "Install Pipa FRP", image: pipafrp },
  { id: 2, title: "Install Pipa HDPE", image: pipahdpe },
  { id: 3, title: "Install Pipa PVDF", image: pipapvdf },
  { id: 4, title: "Install Pipa PP", image: pipapp },
  { id: 5, title: "Install FRP Cable Tray", image: frpcabletray },
  { id: 6, title: "Install FRP Cable Ladder", image: frpcableladder },
  { id: 7, title: "Install FRP Moulded Grating", image: frpmoulded },
  { id: 8, title: "Tank ECTFE", image: tankectfe },
  { id: 9, title: "Lining FRP", image: liningfrp },
];

const Jasasection = () => {
  const navigate = useNavigate(); // navigasi button

  const handleSelengkapnya = () => {
    navigate('/jasa'); // << ngarah ke page jasa
  };

  return (
    <div className="jasa-section1">
      <h2 className="jasa-title1">Jasa Yang Kami Tawarkan</h2>
      <div className="jasa-grid">
        {jasaList.map((item) => (
          <div className="jasa-item" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="jasa-caption">
              {item.id}. {item.title}
            </div>
          </div>
        ))}
      </div>
      <div className="jasa-button-wrapper">
        <button className="jasa-button" onClick={handleSelengkapnya}>
          Selengkapnya
        </button>
      </div>
    </div>
  );
};

export default Jasasection;
