import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosInstance'; 
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import './DashboardDirektur.css'; 

function DashboardDirektur() {
    const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
    const [monthlyOrdersCount, setMonthlyOrdersCount] = useState(0);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);
    const [monthlyOrderTrends, setMonthlyOrderTrends] = useState([]);
    const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF194F'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const base = '/direktur-dashboard';

                const pendingRes = await axios.get(`${base}/pending-payments-count`);
                setPendingPaymentsCount(pendingRes.data.count);

                const monthlyOrdersRes = await axios.get(`${base}/monthly-orders-count`);
                setMonthlyOrdersCount(monthlyOrdersRes.data.count);

                const usersRes = await axios.get(`${base}/total-users-count`);
                setTotalUsersCount(usersRes.data.count);

                const recentOrdersRes = await axios.get(`${base}/recent-orders`);
                setRecentOrders(recentOrdersRes.data.recentOrders);

                const trendsRes = await axios.get(`${base}/monthly-trends`);
                setMonthlyOrderTrends(trendsRes.data);

                const statusDistRes = await axios.get(`${base}/status-distribution`);
                setOrderStatusDistribution(statusDistRes.data);
            } catch (err) {
                console.error("Error fetching dashboard data for Direktur:", err);
                setError("Gagal memuat data dashboard direktur. " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="dashboard-container">Memuat data dashboard direktur...</div>;
    if (error) return <div className="dashboard-container error-message">Error: {error}</div>;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-header">Direktur Dashboard PT. Eco Metalindo Indonesia</h2>

            <div className="dashboard-cards-grid">
                <div className="dashboard-card">
                    <div className="card-value">{pendingPaymentsCount}</div>
                    <div className="card-label">Pembayaran Tertunda</div>
                </div>
                <div className="dashboard-card">
                    <div className="card-value">{monthlyOrdersCount}</div>
                    <div className="card-label">Pesanan Bulan Ini</div>
                </div>
                <div className="dashboard-card">
                    <div className="card-value">{totalUsersCount}</div>
                    <div className="card-label">Total Pengguna</div>
                </div>
            </div>

            <div className="dashboard-charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title">Tren Pesanan Bulanan (12 Bulan Terakhir)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyOrderTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="uv" stroke="#8884d8" activeDot={{ r: 8 }} name="Jumlah Pesanan" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title">Distribusi Status Pesanan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={orderStatusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {orderStatusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="recent-orders-section">
                <h3 className="recent-orders-title">Pesanan Terbaru</h3>
                {recentOrders.length > 0 ? (
                    <table className="recent-orders-table">
                        <thead>
                            <tr>
                                <th>Nama Pelanggan</th>
                                <th>Jenis Jasa</th>
                                <th>Tanggal Kickoff</th>
                                <th>Status Pesanan</th>
                                <th>Dibuat Pada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order.nama}</td>
                                    <td>{order.jenis_jasa}</td>
                                    <td>{new Date(order.tanggal_kickoff).toLocaleDateString('id-ID')}</td>
                                    <td>{order.status_pemesanan}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Tidak ada pesanan terbaru.</p>
                )}
            </div>
        </div>
    );
}

export default DashboardDirektur;
