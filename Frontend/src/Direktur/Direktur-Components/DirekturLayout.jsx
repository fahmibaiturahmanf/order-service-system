import React from 'react';
import { Outlet } from 'react-router-dom';
import DirekturSidebar from '../DirekturSidebar'; 
import './DirekturLayout.css'; 

function DirekturLayout() {
  return (
    <div className="direktur-layout">
      <DirekturSidebar />
      <div className="direktur-content-wrapper">
        <div className="direktur-main-content">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}

export default DirekturLayout;
