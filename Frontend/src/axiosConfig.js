import axios from 'axios';
import { getToken, clearAllAuthData } from '../src/utils/auth'; 

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', 
  timeout: 10000, // Timeout request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
axiosInstance.interceptors.request.use(
  (config) => {
    // Coba dapatkan token untuk peran 'user' terlebih dahulu
    let token = getToken('user');

    // Jika tidak ada token user, coba untuk 'admin'
    if (!token) {
      token = getToken('admin');
    }

    // Jika tidak ada token admin, coba untuk 'direktur'
    if (!token) {
      token = getToken('direktur');
    }
    
    // Jika ada token, tambahkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani respons error (misal: token kadaluarsa)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika error adalah 401 Unauthorized atau 403 Forbidden
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("axiosConfig: Token tidak valid atau kadaluarsa. Melakukan clearAllAuthData.");
      clearAllAuthData(); 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
