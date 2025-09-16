import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DirekturLogin from '../DirekturLogin'; 
import DirekturDaftar from '../DirekturDaftar'; 
import DirekturLayout from './DirekturLayout'; 
import DashboardDirektur from '../Pages-Direktur/DashboardDirektur'; 
import OrderListDirektur from '../Pages-Direktur/OrderListDirektur'; 
import RecapDirektur from '../Pages-Direktur/RecapDirektur'; 
import ProfileDirektur from '../Pages-Direktur/ProfileDirektur';
import ProtectedRouteDirektur from './ProtectedRouteDirektur'; 

const DirekturRoutes = ({ onDirekturLoginSuccess, authStatus }) => {
  return (
    <Routes>
      {/* Rute login dan daftar Direktur TIDAK DILINDUNGI */}
      <Route path="login" element={<DirekturLogin onLoginSuccess={onDirekturLoginSuccess} />} />
      <Route path="daftar" element={<DirekturDaftar />} />

      {/* ✅ Kirim authStatus ke ProtectedRouteDirektur */}
      <Route element={<ProtectedRouteDirektur authStatus={authStatus} />}>
        <Route path="/" element={<DirekturLayout />}>
          <Route index element={<DashboardDirektur />} />
          <Route path="dashboard" element={<DashboardDirektur />} />
          <Route path="profile" element={<ProfileDirektur />} />
          <Route path="order-list" element={<OrderListDirektur />} />
          <Route path="rekap" element={<RecapDirektur />} />
        </Route>
      </Route>

      {/* Fallback jika URL tidak cocok */}
      <Route path="*" element={<Navigate to="/direktur/login" replace />} />
    </Routes>
  );
};

export default DirekturRoutes;
