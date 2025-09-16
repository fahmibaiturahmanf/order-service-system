import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import './invoicePage.css';
import { useNavigate } from 'react-router-dom';

function InvoicePage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [invoiceType, setInvoiceType] = useState('');

    const navigate = useNavigate();

    const fetchInvoices = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/admin-invoices/all-invoices-data');
            setInvoices(response.data.invoices || []);
        } catch (e) {
            console.error('Error keseluruhan saat mengambil invoice:', e.response?.data || e.message);
            setError(new Error(e.response?.data?.message || e.message || 'Gagal memuat data invoice.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const handleValidasi = async (pembayaranId, statusValidasi, jenisPembayaran) => {
        try {
            await axiosInstance.post('/admin-invoices/validate-payment', {
                pembayaranId,
                statusValidasi,
                jenisPembayaran
            });

            alert(`${jenisPembayaran} berhasil ${statusValidasi === 'Valid' ? 'divalidasi' : 'ditolak'}.`);
            fetchInvoices();
        } catch (e) {
            let errorMessage = "Terjadi kesalahan validasi yang tidak diketahui.";
            if (e.response?.data?.message) {
                errorMessage = `Validasi Gagal: ${e.response.data.message}`;
            } else if (e.message) {
                errorMessage = `Kesalahan jaringan/API: ${e.message}`;
            }
            alert(errorMessage);
            console.error(errorMessage);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!selectedOrder) return;

        try {
            await axiosInstance.post(
                `/admin-invoices/generate-invoice/${selectedOrder.pemesananId}`,
                { type: invoiceType }
            );

            alert(`Invoice ${invoiceType === 'dp' ? 'DP' : 'Pelunasan'} berhasil dikirim.`);
            setShowModal(false);
            fetchInvoices();
        } catch (error) {
            let errorMessage = "Gagal membuat invoice. Silakan coba lagi.";
            if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
                errorMessage = "Gagal membuat invoice: Operasi memakan waktu terlalu lama.";
            } else if (error.response?.data?.message) {
                errorMessage = `Gagal membuat invoice: ${error.response.data.message}`;
            } else if (error.message) {
                errorMessage = `Kesalahan jaringan/API: ${error.message}`;
            }
            alert(errorMessage);
            console.error(errorMessage);
        }
    };

    const handlePembatalan = async (pemesananId, aksi) => {
        try {
            await axiosInstance.patch(`/admin-invoices/pembatalan/${pemesananId}`, {
                aksi
            });

            alert(`Berhasil ${aksi === 'setuju' ? 'menyetujui' : 'menolak'} pembatalan.`);
            fetchInvoices();
        } catch (error) {
            alert("Gagal memproses pembatalan.");
            console.error("Gagal memproses pembatalan:", error.response?.data?.message || error.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (loading) return <div className="loading-message">⏳ Memuat data invoice...</div>;
    if (error) return <div className="error-message">❌ Error: {error.message}</div>;

    return (
    <div className="invoice-container">
        <h2>Validasi Pemesanan</h2>
        <button className="refresh-button" onClick={fetchInvoices}>Refresh Data</button>
        <div className="table-wrapper">
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Nama Pemesan</th>
                        <th>Email</th>
                        <th>Jenis Jasa</th>
                        <th>Tgl Pemesanan</th>
                        <th>Tgl Kickoff</th>
                        <th>Bukti Bayar</th>
                        <th>Nomor Referensi</th>
                        <th>Total Harga</th>
                        <th>Status Pembayaran</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.length > 0 ? (
                        invoices.map((inv) => {
                            const dpPayment = inv.allPayments?.find(p => p.tipe_pembayaran === 'DP');
                            const pelunasanPayment = inv.allPayments?.find(p => p.tipe_pembayaran === 'Pelunasan');

                            return (
                                <tr key={inv.pemesananId}>
                                    <td><div className="cell-content"><strong>{inv.pemesan?.nama || 'N/A'}</strong></div></td>
                                    <td><div className="cell-content"><small>{inv.pemesan?.email || 'N/A'}</small></div></td>
                                    <td><div className="cell-content">{inv.jenisJasa || 'N/A'}</div></td>
                                    <td><div className="cell-content">{formatDate(inv.tanggalPemesanan)}</div></td>
                                    <td><div className="cell-content">{formatDate(inv.tanggalKickoff)}</div></td>
                                    <td>
                                        <div className="cell-content">
                                            {inv.buktiPembayaran ? (
                                                <a
                                                    href={`http://localhost:5000/uploads/${inv.buktiPembayaran}`}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="bukti-bayar-link"
                                                >
                                                    Lihat
                                                </a>
                                            ) : 'Belum'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-content">
                                            {dpPayment?.nomor_referensi || pelunasanPayment?.nomor_referensi || 'Belum Ada'}
                                        </div>
                                    </td>
                                    <td><div className="cell-content">Rp {inv.totalHarga?.toLocaleString('id-ID') || '-'}</div></td>
                                    <td>
                                        <div className="cell-content">
                                            {inv.status_pemesanan_utama === 'Dibatalkan' ? (
                                                <span className="status-badge dibatalkan">Pesanan Dibatalkan</span>
                                            ) : (
                                                <span className={`status-badge ${inv.statusPembayaran?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {inv.statusPembayaran || 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="aksi-buttons">
                                            {['DP', 'Pelunasan'].map(type => {
                                                const payment = inv.allPayments?.find(p => p.tipe_pembayaran === type);
                                                return payment && ['belum divalidasi', 'menunggu validasi'].includes(payment.status?.toLowerCase()) && (
                                                    <React.Fragment key={`${inv.pemesananId}-${type}`}>
                                                        <button className="valid-button" onClick={() => handleValidasi(payment._id, 'Valid', type)}>Validasi {type}</button>
                                                        <button className="tolak-button" onClick={() => handleValidasi(payment._id, 'Invalid', type)}>Tolak {type}</button>
                                                    </React.Fragment>
                                                );
                                            })}

                                            {inv.statusPembayaran?.toLowerCase() === 'dp terbayar' && !inv.invoiceUrlDP && (
                                                <button
                                                    className="generate-invoice-button"
                                                    onClick={() => {
                                                        setSelectedOrder(inv);
                                                        setInvoiceType('dp');
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Generate Invoice DP
                                                </button>
                                            )}
                                            {inv.statusPembayaran?.toLowerCase() === 'dp terbayar' && inv.invoiceUrlDP && (
                                                <a href={`http://localhost:5000${inv.invoiceUrlDP}`} target="_blank" rel="noopener noreferrer" className="view-invoice-link">Lihat Invoice DP</a>
                                            )}
                                            {inv.statusPembayaran?.toLowerCase() === 'lunas' && !inv.invoiceUrlPelunasan && (
                                                <button
                                                    className="generate-invoice-button"
                                                    onClick={() => {
                                                        setSelectedOrder(inv);
                                                        setInvoiceType('pelunasan');
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Generate Invoice Pelunasan
                                                </button>
                                            )}
                                            {inv.statusPembayaran?.toLowerCase() === 'lunas' && inv.invoiceUrlPelunasan && (
                                                <a href={`http://localhost:5000${inv.invoiceUrlPelunasan}`} target="_blank" rel="noopener noreferrer" className="view-invoice-link">Lihat Invoice Pelunasan</a>
                                            )}

                                            {inv.status_pemesanan_utama === 'Menunggu Persetujuan Pembatalan' && (
                                            <div className="pembatalan-section">
                                                <div className="alasan-box">
                                                    <strong>Alasan Pembatalan:</strong>
                                                    <p>{inv.alasan_pembatalan || 'Tidak ada alasan diberikan.'}</p>
                                                </div>
                                                <button className="valid-button" onClick={() => handlePembatalan(inv.pemesananId, 'setuju')}>
                                                    ✅ Setujui Pembatalan
                                                </button>
                                                <button className="tolak-button" onClick={() => handlePembatalan(inv.pemesananId, 'tolak')}>
                                                    ❌ Tolak Pembatalan
                                                </button>
                                            </div>
                                        )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="10" className="no-invoices-found">Tidak ada invoice ditemukan.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {showModal && selectedOrder && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Konfirmasi Pengiriman Invoice</h3>
                    <p><strong>Nama:</strong> {selectedOrder.pemesan?.nama}</p>
                    <p><strong>Email:</strong> {selectedOrder.pemesan?.email}</p>
                    <p><strong>Total Harga:</strong> Rp. {selectedOrder.totalHarga?.toLocaleString('id-ID')}</p>
                    <p><strong>Sisa Tagihan:</strong> Rp. {selectedOrder.sisa_tagihan_pemesanan?.toLocaleString('id-ID') || '0'}</p>
                    <p><strong>Status Pembayaran:</strong> {selectedOrder.statusPembayaran}</p>
                    <div className="modal-buttons">
                        <button className="confirm-button" onClick={handleGenerateInvoice}>Kirim Sekarang</button>
                        <button className="cancel-button" onClick={() => setShowModal(false)}>Batal</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);

}

export default InvoicePage;
