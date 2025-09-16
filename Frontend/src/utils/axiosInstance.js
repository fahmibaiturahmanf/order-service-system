import axios from 'axios';
import { getToken } from './auth';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const currentPath = window.location.pathname;
        let token = null;

        if (currentPath.startsWith('/admin')) {
            token = getToken('admin');
        } else if (currentPath.startsWith('/direktur')) {
            token = getToken('direktur');
        } else {
            token = getToken('user');
        }

        // ✅ Daftar endpoint publik (tanpa perlu token)
        const publicEndpoints = ['/jasa'];
        const isPublic = publicEndpoints.some(endpoint =>
            config.url?.includes(endpoint)
        );

        if (!isPublic && token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`axiosInstance: Token ditambahkan ke header Authorization untuk URL: ${config.url}`);
        } else if (isPublic) {
            console.log(`axiosInstance: Melewati token karena ini endpoint publik: ${config.url}`);
        } else {
            console.warn(`axiosInstance: Tidak ada token ditemukan untuk URL: ${config.url}`);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            console.warn("axiosInstance: Menerima respons 401/403. Mengarahkan ke halaman login.");

            alert("Sesi Anda telah berakhir atau akses ditolak. Silakan login kembali.");

            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
                window.location.href = '/admin/login';
            } else if (currentPath.startsWith('/direktur')) {
                window.location.href = '/direktur/login';
            } else {
                window.location.href = '/akun';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
