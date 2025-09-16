import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuthStatus, clearSpecificAuthData } from './utils/auth';

import DirekturLogin from './Direktur/DirekturLogin';
import AdminLogin from './Admin/AdminLogin';
import AdminRegister from './Admin/AdminRegister';
import DirekturRegister from './Direktur/DirekturDaftar';

import UserLayout from './Components/Pages/UserLayout';
import Hero from './Components/Hero/Hero';
import Introduction from './Components/Introduction/Introduction';
import Jasasection from './Components/Jasasection/Jasasection';
import Ordersection from './Components/Ordersection/Ordersection';
import Minicompany from './Components/Minicompany/Minicompany';
import FormPemesanan from './Components/Pages/FormPemesanan';
import Paymentorder from './Components/Pages/Paymentorder';
import Daftar from './Components/Pages/Daftar';
import Profile from './Components/Pages/Profile';
import Akun from './Components/Pages/Akun';
import Resetpass from './Components/Pages/Resetpass';
import Resetpassform from './Components/Pages/Resetpassform';
import Tentangkami from './Components/Pages/Tentangkami';
import Jasa from './Components/Pages/Jasa';
import Kontak from './Components/Pages/Kontak';
import UpdateProfile from './Components/Pages/Updateprofile';
import Meeting from './Components/Pages/Meeting';
import AdminRoutes from './Admin/AdminRoutes';
import DirekturRoutes from './Direktur/Direktur-Components/DirekturRoutes';

const App = () => {
  const [allAuthStatus, setAllAuthStatus] = useState({
    user: false,
    admin: false,
    direktur: false,
    currentActiveRole: 'none',
    userData: null
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // <- Tambahan loading

  const navigate = useNavigate();
  const location = useLocation();

  const updateAllAuthStatus = useCallback(() => {
    const userStatus = getAuthStatus('user');
    const adminStatus = getAuthStatus('admin');
    const direkturStatus = getAuthStatus('direktur');

    let activeRole = 'none';
    let activeUserData = null;

    if (direkturStatus.isAuthenticated && direkturStatus.userRole === 'direktur') {
      activeRole = 'direktur';
      activeUserData = direkturStatus.userData;
    } else if (adminStatus.isAuthenticated && adminStatus.userRole === 'admin') {
      activeRole = 'admin';
      activeUserData = adminStatus.userData;
    } else if (userStatus.isAuthenticated && userStatus.userRole === 'user') {
      activeRole = 'user';
      activeUserData = userStatus.userData;
    }

    setAllAuthStatus({
      user: userStatus.isAuthenticated && userStatus.userRole === 'user',
      admin: adminStatus.isAuthenticated && adminStatus.userRole === 'admin',
      direktur: direkturStatus.isAuthenticated && direkturStatus.userRole === 'direktur',
      currentActiveRole: activeRole,
      userData: activeUserData
    });

    setIsLoadingAuth(false); // <- SET LOADING SELESAI

    console.log("App.jsx - All Auth Status Updated:", {
      user: userStatus.isAuthenticated,
      admin: adminStatus.isAuthenticated,
      direktur: direkturStatus.isAuthenticated,
      currentActiveRole: activeRole,
      userData: activeUserData
    });
  }, []);

  useEffect(() => {
    updateAllAuthStatus();

    const handleStorageChange = (event) => {
      if (event.key && (
        event.key.startsWith('authToken_') ||
        event.key.startsWith('userData_') ||
        event.key === null
      )) {
        setTimeout(() => {
          updateAllAuthStatus();
        }, 50);
      }
    };

    const handleAuthDataChanged = () => {
      updateAllAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authDataChanged', handleAuthDataChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authDataChanged', handleAuthDataChanged);
    };
  }, [updateAllAuthStatus]);

  const manualUpdateAuth = useCallback(() => {
    updateAllAuthStatus();
  }, [updateAllAuthStatus]);

  const handleLogout = useCallback((role) => {
    clearSpecificAuthData(role);
    updateAllAuthStatus();
    if (role === 'user') {
      navigate('/akun', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/login', { replace: true });
    } else if (role === 'direktur') {
      navigate('/direktur/login', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate, updateAllAuthStatus]);

  const handleLoginSuccess = useCallback((role) => {
    if (role === 'user') {
      navigate('/profile', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'direktur') {
      navigate('/direktur/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const RequireAuth = ({ children, allowedRoles }) => {
    const isUserAuthenticated = allAuthStatus.user && allowedRoles === 'user';
    const isAdminAuthenticated = allAuthStatus.admin && allowedRoles === 'admin';
    const isDirekturAuthenticated = allAuthStatus.direktur && allowedRoles === 'direktur';

    const isCurrentlyAuthenticated =
      isUserAuthenticated || isAdminAuthenticated || isDirekturAuthenticated;

    if (!isCurrentlyAuthenticated) {
      if (allowedRoles === 'user') {
        return <Navigate to="/akun" replace state={{ from: location.pathname }} />;
      } else if (allowedRoles === 'admin') {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
      } else if (allowedRoles === 'direktur') {
        return <Navigate to="/direktur/login" replace state={{ from: location.pathname }} />;
      }
      return <Navigate to="/" replace />;
    }

    if (!allAuthStatus.userData) {
      clearSpecificAuthData(allAuthStatus.currentActiveRole);
      if (allAuthStatus.currentActiveRole === 'user') {
        return <Navigate to="/akun" replace />;
      } else if (allAuthStatus.currentActiveRole === 'admin') {
        return <Navigate to="/admin/login" replace />;
      } else if (allAuthStatus.currentActiveRole === 'direktur') {
        return <Navigate to="/direktur/login" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return children;
  };

  // ❗ STOP render kalau auth belum selesai dibaca
  if (isLoadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Login & Register (public) */}
      <Route path="/admin/login" element={<AdminLogin onLoginSuccess={() => handleLoginSuccess('admin')} />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/direktur/login" element={<DirekturLogin onLoginSuccess={() => handleLoginSuccess('direktur')} />} />
      <Route path="/direktur/register" element={<DirekturRegister />} />

      {/* Proteksi AdminRoutes */}
      <Route path="/admin/*" element={
        <RequireAuth allowedRoles="admin">
          <AdminRoutes currentAuthRole={allAuthStatus.currentActiveRole} onLogout={() => handleLogout('admin')} />
        </RequireAuth>
      } />

      {/* Proteksi DirekturRoutes */}
      <Route path="/direktur/*" element={
        <RequireAuth allowedRoles="direktur">
          <DirekturRoutes currentAuthRole={allAuthStatus.currentActiveRole} onLogout={() => handleLogout('direktur')} authStatus={allAuthStatus} />
        </RequireAuth>
      } />

      {/* Public/User Routes */}
      <Route path="/*" element={<UserLayout authStatus={allAuthStatus} onLogout={handleLogout} />}>
        <Route index element={<><Hero /><Introduction /><Jasasection /><Ordersection /><Minicompany /></>} />
        <Route path="tentangkami" element={<Tentangkami />} />
        <Route path="jasa" element={<Jasa />} />
        <Route path="kontak" element={<Kontak />} />
        <Route path="daftar" element={<Daftar />} />
        <Route path="resetpass" element={<Resetpass />} />
        <Route path="resetpass-form" element={<Resetpassform />} />
        <Route path="akun" element={<Akun onLoginSuccess={() => handleLoginSuccess('user')} manualUpdateAuth={manualUpdateAuth} />} />
        <Route path="profile" element={<RequireAuth allowedRoles="user"><Profile onLogout={() => handleLogout('user')} /></RequireAuth>} />
        <Route path="update-profile" element={<RequireAuth allowedRoles="user"><UpdateProfile onProfileUpdate={manualUpdateAuth} /></RequireAuth>} />
        <Route path="formpemesanan" element={<RequireAuth allowedRoles="user"><FormPemesanan /></RequireAuth>} />
        <Route path="meeting" element={<RequireAuth allowedRoles="user"><Meeting /></RequireAuth>} />
        <Route path="paymentorder" element={<RequireAuth allowedRoles="user"><Paymentorder /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
