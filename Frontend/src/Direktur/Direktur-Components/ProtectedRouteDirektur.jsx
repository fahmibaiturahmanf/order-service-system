import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRouteDirektur = ({ authStatus }) => {
  const location = useLocation();

  if (!authStatus.direktur || authStatus.currentActiveRole !== 'direktur') {
    console.warn("ProtectedRouteDirektur: Akses ditolak. Redirect ke login.");
    return <Navigate to="/direktur/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRouteDirektur;
