import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import axios from 'axios'; 
import './axiosConfig.js'
axios.defaults.baseURL = 'http://localhost:5000/api';

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(
    response => response,
    error => {
        // HANYA AXIOS INTERCEPTOR YANG MENGATUR LOGOUT JIKA 401 DITERIMA
        if (error.response && error.response.status === 401) {
            console.warn("Axios Interceptor: Sesi berakhir atau token tidak valid. Mengarahkan ke halaman login.");
            localStorage.removeItem('token'); // Hapus 'token'
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('adminToken'); // Hapus juga adminToken jika ada
            localStorage.removeItem('adminUser');
            localStorage.removeItem('isAdminLoggedIn');

            window.location.href = '/akun'; // Arahkan ke halaman login
        }
        return Promise.reject(error);
    }
);


ReactDOM.createRoot(document.getElementById('root')).render(
 <React.StrictMode>
 <BrowserRouter>
 <App />
 </BrowserRouter>
 </React.StrictMode>
);