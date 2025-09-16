import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../Admin/Components-admin/AdminLayout'; 
import DashboardHome from '../Admin/Pages-admin/DashboardHome'; 
import InvoicePage from '../Admin/Pages-admin/InvoicePage'; 
import OrderList from '../Admin/Pages-admin/OrderList'; 
import Recap from './Pages-admin/Recap'; 
import ServiceList from '../Admin/Pages-admin/ServiceList'; 
import UserList from '../Admin/Pages-admin/UserList'; 
import AdminProfile from '../Admin/Pages-admin/AdminProfile'; 

function AdminRoutes({ currentAuthRole, onLogout }) { 
  return (
    <Routes>
      {/* Rute login dan register admin sudah dipindahkan ke App.jsx, di luar AdminRoutes */}

      {/* Rute induk untuk layout Admin. Semua children akan menggunakan AdminLayout */}
      <Route path="/" element={<AdminLayout currentAuthRole={currentAuthRole} onLogout={onLogout} />}>

          <Route index element={<DashboardHome />} /> 
          <Route path="dashboardhome" element={<DashboardHome />} /> 
          <Route path="profile" element={<AdminProfile />} /> 
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="recap" element={<Recap />} />
          <Route path="services" element={<ServiceList />} />
          <Route path="users" element={<UserList />} />
      </Route>

      {/* Jika ada path yang tidak cocok di bawah /admin/, redirect ke dashboard home */}
      {/* Karena AdminRoutes sudah diproteksi oleh RequireAuth di App.jsx,
          seharusnya yang sampai ke sini adalah admin yang sudah login. */}
      <Route path="*" element={<Navigate to="dashboardhome" replace />} />
    </Routes>
  );
}

export default AdminRoutes;