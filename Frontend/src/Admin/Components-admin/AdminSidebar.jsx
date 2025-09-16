import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './adminSidebar.css';
import {
    MdDashboard, MdListAlt, MdReceipt, MdAttachMoney, MdDesignServices, MdPeople, MdLogout, MdAccountCircle
} from 'react-icons/md';

// Terima props onLogout dan currentAuthRole 
function AdminSidebar({ onLogout, currentAuthRole }) { 

    return (
        <div className="admin-sidebar">
            <NavLink
                to="/admin/profile"
                className={({ isActive }) => "admin-sidebar-link profile-link" + (isActive ? " active" : "")}
            >
                <MdAccountCircle className="link-icon" />
                Profil Admin
            </NavLink>

            <NavLink
                to="/admin/dashboardhome"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdDashboard className="link-icon" />
                Dashboard
            </NavLink>

            <NavLink
                to="/admin/orders"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdListAlt className="link-icon" />
                Order List
            </NavLink>

            <NavLink
                to="/admin/invoices"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdReceipt className="link-icon" />
                Invoice Page
            </NavLink>

            <NavLink
                to="/admin/recap"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdAttachMoney className="link-icon" />
                Recap
            </NavLink>

            <NavLink
                to="/admin/services"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdDesignServices className="link-icon" />
                Service List
            </NavLink>

            <NavLink
                to="/admin/users"
                className={({ isActive }) => "admin-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdPeople className="link-icon" />
                User List
            </NavLink>

            <hr className="admin-sidebar-hr" />

            {/* Panggil onLogout dari prop */}
            {onLogout && ( 
                <button onClick={onLogout} className="admin-sidebar-logout-button">
                    <MdLogout className="link-icon" />
                    Logout
                </button>
            )}
        </div>
    );
}

export default AdminSidebar;