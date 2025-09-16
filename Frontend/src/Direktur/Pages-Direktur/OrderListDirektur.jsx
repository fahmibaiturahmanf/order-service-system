import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import './OrderListDirektur.css';

function OrderListDirektur() {
    const [pemesanans, setPemesanans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getStatusDisplay = (pemesananStatus, pembayaranDetailStatus) => {
        let label = pemesananStatus || 'Status Tidak Diketahui';
        let className = (pemesananStatus || 'tidak-diketahui').replace(/\s+/g, '-').toLowerCase();

        if (pembayaranDetailStatus === 'Belum Dibayar') {
            label = 'Menunggu Pembayaran';
            className = 'menunggu-pembayaran';
        } else if (pembayaranDetailStatus === 'DP Terbayar') {
            label = 'DP Terbayar';
            className = 'dp-terbayar';
        } else if (pembayaranDetailStatus === 'Lunas') {
            label = 'Lunas';
            className = 'lunas';
        } else if (pembayaranDetailStatus === 'Menunggu Validasi') {
            label = 'Pembayaran Menunggu Validasi';
            className = 'menunggu-validasi';
        } else if (pembayaranDetailStatus === 'Ditolak') {
            label = 'Pembayaran Ditolak';
            className = 'ditolak';
        }

        if (pemesananStatus === 'Diproses') {
            label = 'Diproses';
            className = 'diproses';
        } else if (pemesananStatus === 'Selesai') {
            label = 'Selesai';
            className = 'selesai';
        } else if (pemesananStatus === 'Dibatalkan') {
            label = 'Dibatalkan';
            className = 'dibatalkan';
        }

        return { label, className };
    };

    useEffect(() => {
        const fetchPemesananData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/direktur-orders');
                console.log('Data dari API direktur:', response.data);
                setPemesanans(response.data.pemesanans || []);
            } catch (err) {
                console.error('Error fetching pemesanan data for Direktur:', err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    localStorage.removeItem('authToken_direktur');
                    localStorage.removeItem('userData_direktur');
                    setError('Sesi habis atau akses tidak sah. Silakan login kembali.');
                    navigate('/direktur/login');
                } else {
                    setError(err.response?.data?.message || 'Gagal mengambil data pemesanan.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPemesananData();
    }, [navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) {
        return (
            <div className="order-list-container">
                <p className="order-list-loading">Memuat daftar pemesanan...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-list-container order-list-error">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (pemesanans.length === 0) {
        return (
            <div className="order-list-container">
                <p className="no-orders-found">Tidak ada pemesanan ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="order-list-container">
            <h2>Daftar Pemesanan</h2>
            <div className="table-wrapper">
                <table className="order-list-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama Pengguna</th>
                            <th>Email</th>
                            <th>No. Telepon</th>
                            <th>Jenis Jasa</th>
                            <th>Tanggal Pemesanan</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pemesanans.map((pemesanan, index) => {
                            const { label: statusLabel, className: statusClass } = getStatusDisplay(
                                pemesanan.status_pemesanan,
                                pemesanan.status_pembayaran_detail
                            );

                            return (
                                <tr key={pemesanan._id}>
                                    <td>{index + 1}</td>
                                    <td>{pemesanan.user_id?.name || pemesanan.nama || 'N/A'}</td>
                                    <td>{pemesanan.user_id?.email || pemesanan.email || 'N/A'}</td>
                                    <td>{pemesanan.user_id?.no_telepon || pemesanan.no_telepon || 'N/A'}</td>
                                    <td>{pemesanan.jenis_jasa || 'N/A'}</td>
                                    <td>{formatDate(pemesanan.created_at)}</td>
                                    <td>
                                        <span className={`status-badge ${statusClass}`}>
                                            {statusLabel}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrderListDirektur;
