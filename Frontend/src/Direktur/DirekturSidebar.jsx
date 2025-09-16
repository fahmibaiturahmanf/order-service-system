import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DirekturSidebar.css';
import {
    MdDashboard, MdListAlt, MdAttachMoney, MdAccountCircle, MdLogout
} from 'react-icons/md';
import { clearAllAuthData } from '../utils/auth'; 

function DirekturSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logout Direktur dipicu');
        clearAllAuthData();
        navigate('/direktur/login');
    };

    return (
        <div className="direktur-sidebar">
            {/* Profil Direktur Link */}
            <NavLink
                to="/direktur/profile" 
                className={({ isActive }) => "direktur-sidebar-link profile-link" + (isActive ? " active" : "")}
            >
                <MdAccountCircle className="link-icon" />
                Profil Direktur
            </NavLink>

            {/* Dashboard Link */}
            <NavLink
                to="/direktur/dashboard" 
                className={({ isActive }) => "direktur-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdDashboard className="link-icon" />
                Dashboard
            </NavLink>

            {/* Order List Link */}
            <NavLink
                to="/direktur/order-list" 
                className={({ isActive }) => "direktur-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdListAlt className="link-icon" />
                Order List
            </NavLink>

            {/* Recap Link */}
            <NavLink
                to="/direktur/rekap" 
                className={({ isActive }) => "direktur-sidebar-link" + (isActive ? " active" : "")}
            >
                <MdAttachMoney className="link-icon" />
                Recap
            </NavLink>

            <hr className="direktur-sidebar-hr" />

            {/* Logout Button */}
            <button onClick={handleLogout} className="direktur-sidebar-logout-button">
                <MdLogout className="link-icon" />
                Logout
            </button>
        </div>
    );
}

export default DirekturSidebar;
