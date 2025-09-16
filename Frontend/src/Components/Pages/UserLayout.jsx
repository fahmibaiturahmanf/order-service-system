import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

const UserLayout = ({ authStatus, onLogout }) => { 
    return (
        <>
            {/* Teruskan authStatus saja ke Navbar */}
            <Navbar authStatus={authStatus} /> 

            {/* Area Konten */}
            <div>
                <Outlet />
            </div>

            <Footer />
        </>
    );
};

export default UserLayout;