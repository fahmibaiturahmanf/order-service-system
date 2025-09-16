import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css'; 

// Terima props currentAuthRole dan onLogout
function AdminLayout({ currentAuthRole, onLogout }) {
  return (
    <div className="admin-layout">
      <AdminSidebar currentAuthRole={currentAuthRole} onLogout={onLogout} />

      {/* Content Wrapper*/}
      <div className="admin-content-wrapper">
        {/* Main Content Area */}
        <div className="admin-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;