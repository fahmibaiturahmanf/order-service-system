import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';
import { getAuthStatus } from '../../utils/auth';

const Navbar = () => {
    const [authStatus, setAuthStatus] = useState(getAuthStatus());
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef();

    const isUserLoggedIn = authStatus?.userData && authStatus?.currentAuthRole === 'user';
    const userId = isUserLoggedIn ? authStatus.userData.id || authStatus.userData._id : null;

    // Ambil notifikasi
    const fetchNotifications = async () => {
        if (!userId) return;
        try {
            const res = await axiosInstance.get(`/notifications/user/${userId}`);
            setNotifications(res.data);
        } catch (err) {
            console.error('Gagal ambil notifikasi:', err);
        }
    };

    useEffect(() => {
        if (isUserLoggedIn) {
            fetchNotifications();
        }
    }, [userId]);

    // Dengarkan perubahan auth dari localStorage
    useEffect(() => {
        const handleAuthChange = () => {
            const updatedStatus = getAuthStatus();
            setAuthStatus(updatedStatus);
        };
        window.addEventListener('authDataChanged', handleAuthChange);
        return () => window.removeEventListener('authDataChanged', handleAuthChange);
    }, []);

    // Tutup dropdown kalau klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = async (notifId) => {
        try {
            await axiosInstance.patch(`/notifications/${notifId}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Gagal update notifikasi:', err);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/">
                <img src={logo} alt="Logo" className="logo" />
            </Link>
            <ul>
                {isUserLoggedIn && (
                    <li className="notif-container" ref={dropdownRef}>
                        <FaBell
                            className="notif-bell"
                            onClick={() => setShowDropdown(!showDropdown)}
                        />
                        {unreadCount > 0 && (
                            <span className="notif-badge">{unreadCount}</span>
                        )}
                        {showDropdown && (
                            <div className="notif-dropdown">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                                            onClick={() => markAsRead(notif._id)}
                                        >
                                            <p>{notif.isi_notifikasi}</p>
                                            <small>{new Date(notif.created_at).toLocaleString()}</small>
                                        </div>
                                    ))
                                ) : (
                                    <p className="notif-item">Tidak ada notifikasi</p>
                                )}
                            </div>
                        )}
                    </li>
                )}
                <li><Link to="/">Beranda</Link></li>
                <li><Link to="/jasa">Jasa</Link></li>
                <li><Link to="/tentangkami">Tentang Kami</Link></li>
                <li><Link to="/kontak">Kontak</Link></li>
                <li>
                    {isUserLoggedIn ? (
                        <Link to="/profile">Profil</Link>
                    ) : (
                        <Link to="/akun">Akun</Link>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
