import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance';
import './orderList.css';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get('/admin/orders');
                const data = res.data;
                console.log('Data dari API:', data);
                setOrders(data.pemesanans || []);
            } catch (error) {
                console.error('Gagal ambil data:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    if (loading) return <div className="order-list-loading">Memuat daftar pesanan...</div>;
    if (error) return <div className="order-list-error">Error: {error.message}</div>;

    return (
        <div className="order-list-container">
            <h2>Daftar Pesanan</h2>
            <div className="table-wrapper">
                <table className="order-list-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama Pengguna</th>
                            <th>Jenis Jasa</th>
                            <th>Tanggal Pemesanan</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order, index) => {
                                const { label: statusLabel, className: statusClass } = getStatusDisplay(
                                    order.status_pemesanan,
                                    order.status_pembayaran_detail
                                );

                                return (
                                    <tr key={order._id}>
                                        <td>{index + 1}</td>
                                        <td>{order.nama}</td>
                                        <td>{order.jenis_jasa || 'N/A'}</td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td className={`status-badge ${statusClass}`}>
                                            {statusLabel}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-orders-found">
                                    Tidak ada pesanan ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrderList;
