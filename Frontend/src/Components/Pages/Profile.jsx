import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaTools,
  FaCheckCircle,
  FaHourglassHalf,
  FaFileInvoice,
} from 'react-icons/fa';
import './Profile.css';
import {
  getUserData,
  getToken,
  clearSpecificAuthData,
  getAuthStatus,
} from '../../utils/auth';

const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const authStatus = getAuthStatus('user');
    if (
      authStatus.isAuthenticated &&
      authStatus.userRole === 'user' &&
      authStatus.userData
    ) {
      setUser(authStatus.userData);
    } else {
      navigate('/akun', { replace: true });
    }
  }, [navigate, onLogout]);

  const getStatusDisplay = useCallback((pemesananStatus, pembayaranDetailStatus) => {
    let label = pemesananStatus || 'Status Tidak Diketahui';
    let className = (pemesananStatus || 'tidak-diketahui')
      .replace(/\s+/g, '-')
      .toLowerCase();

    if (pembayaranDetailStatus === 'Menunggu Validasi') {
      label = 'Pembayaran Menunggu Validasi';
      className = 'menunggu-validasi';
    } else if (pembayaranDetailStatus === 'Belum Dibayar') {
      label = 'Menunggu Pembayaran DP';
      className = 'menunggu-pembayaran';
    } else if (pembayaranDetailStatus === 'DP Terbayar') {
      label = 'DP Terbayar';
      className = 'dp-terbayar';
    } else if (pembayaranDetailStatus === 'Lunas') {
      label = 'Lunas';
      className = 'lunas';
    }

    if (pemesananStatus === 'Diproses') {
      label = 'Pesanan Diproses';
      className = 'diproses';
    } else if (pemesananStatus === 'Selesai') {
      label = 'Selesai';
      className = 'selesai';
    } else if (pemesananStatus === 'Dibatalkan') {
      label = 'Dibatalkan';
      className = 'dibatalkan';
    } else if (pemesananStatus === 'Menunggu Persetujuan Pembatalan') {
      label = 'Menunggu Persetujuan Pembatalan';
      className = 'dibatalkan';
    }

    return { label, className };
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setOrdersError(null);

    const userToken = getToken('user');
    const currentUserData = getUserData('user');

    if (!userToken || !currentUserData || currentUserData.role !== 'user') {
      setLoadingOrders(false);
      return;
    }

    try {
      const response = await axios.get(
        'http://localhost:5000/api/user-pemesanan/my-orders',
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      const sortedOrders = response.data.pemesanans.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOrders(sortedOrders);
    } catch (error) {
      setOrdersError(error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        clearSpecificAuthData('user');
        if (onLogout) onLogout();
        navigate('/akun', { replace: true });
      }
    } finally {
      setLoadingOrders(false);
    }
  }, [user, onLogout, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const handlePaymentAction = (
    orderId,
    totalHargaProyek,
    sisaTagihanSaatIni,
    tipePembayaranYangAkanDilakukan
  ) => {
    navigate(`/paymentorder`, {
      state: {
        pemesananId: orderId,
        totalHarga: totalHargaProyek,
        sisaTagihan: sisaTagihanSaatIni,
        tipePembayaran: tipePembayaranYangAkanDilakukan,
      },
    });
  };

  const handleAjukanPembatalan = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitPembatalan = async () => {
    if (!cancelReason.trim()) {
      alert('Alasan pembatalan tidak boleh kosong.');
      return;
    }

    const konfirmasi = window.confirm('Yakin ingin membatalkan pesanan ini?');
    if (!konfirmasi) return;

    try {
      const token = getToken('user');
      const response = await axios.patch(
        `http://localhost:5000/api/user-pemesanan/${selectedOrderId}/ajukan-batal`,
        { alasan: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message || 'Permintaan pembatalan berhasil diajukan.');
      setShowCancelModal(false);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengajukan pembatalan.');
    }
  };

  const handleLogoutClick = () => {
    clearSpecificAuthData('user');
    window.dispatchEvent(new Event('authDataChanged'));
    if (onLogout) onLogout();
    navigate('/akun', { replace: true });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) return <div className="profile-error">Memuat data profil...</div>;
  if (loadingOrders) return <div className="profile-loading">Memuat pesanan...</div>;
  if (ordersError)
    return <div className="profile-error">Error: {ordersError.message}</div>;

  return (
    <div className="profile-container">
      <div className="page-title">
        <h1>Akun Saya</h1>
      </div>

      <div className="profile-boxes">
        <div className="info-box">
          <label>Nama</label>
          <div className="input-box">{user.name}</div>
          <label>Email</label>
          <div className="input-box">{user.email}</div>
          <label>No. Telepon</label>
          <div className="input-box">{user.phone}</div>
        </div>
        <div className="address-box">
          <label>Alamat</label>
          <div className="address-content">{user.alamat}</div>
          <div className="tombol-kelas1">
            <button
              className="tombol-perbaruhi"
              onClick={() => navigate('/update-profile')}
            >
              Perbarui Profil
            </button>
            <button className="tombol-out" onClick={handleLogoutClick}>
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="orders-section">
        <div className="order-anda">Daftar Pesanan Anda</div>
        {orders.length > 0 ? (
          <div className="order-grid">
            {orders.map((order) => {
            const { label: statusLabel, className: statusClass } =
              getStatusDisplay(order.status_pemesanan, order.status_pembayaran_detail);

            const isBatal = order.status_pemesanan === 'Dibatalkan';
            const isMenungguPembatalan = order.status_pemesanan === 'Menunggu Persetujuan Pembatalan';

            return (
              <div key={order._id} className="order-card">
                <div className="card-header">
                  <h3>
                    <FaTools /> {order.jenis_jasa}
                  </h3>
                  <span className={`order-status-badge ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="card-body">
                  <p>
                    <strong>Nama Pemesan:</strong> {order.nama || user.name}
                  </p>
                  <p>
                    <FaCalendarAlt /> <strong>Tanggal Pemesanan:</strong> {formatDate(order.created_at)}
                  </p>
                  <p>
                    <FaCalendarAlt /> <strong>Tanggal Pertemuan Meeting:</strong> {formatDate(order.tanggal_kickoff)}
                  </p>
                  <p>
                    <FaMoneyBillWave /> <strong>Total Harga Proyek:</strong> Rp.{order.harga_jasa?.toLocaleString('id-ID')}
                  </p>

                  {!isBatal && !isMenungguPembatalan &&
                    order.status_pembayaran_detail !== 'Menunggu Validasi' &&
                    order.sisa_tagihan > 0 && (
                      <p className="sisa-tagihan">
                        <FaMoneyBillWave /> <strong>
                          {order.status_pembayaran_detail === 'Belum Dibayar'
                            ? 'Tagihan Down Payment Yang Harus Dibayar:'
                            : 'Sisa Tagihan:'}
                        </strong>{' '}
                        Rp.{order.sisa_tagihan.toLocaleString('id-ID')}
                      </p>
                  )}

                  {!isBatal && !isMenungguPembatalan &&
                    order.status_pembayaran_detail === 'Belum Dibayar' &&
                    order.sisa_tagihan > 0 && (
                      <p className="alert-message">
                        ⚠️ Dimohon untuk membayar tagihan 50% dari jasa maksimal 2 hari setelah
                        pertemuan dalam meeting.
                      </p>
                  )}

                  {!isBatal && !isMenungguPembatalan &&
                    order.status_pembayaran_detail === 'DP Terbayar' &&
                    order.sisa_tagihan > 0 && (
                      <p className="alert-message">
                        ⚠️ Dimohon untuk membayar sisa tagihan dari jasa yang dipilih, Dengan Maksimal 2 hari setelah jasa telah selesai.
                      </p>
                  )}

                  {order.invoiceUrlDP && (
                    <p>
                      <a
                        href={`http://localhost:5000${order.invoiceUrlDP}`}
                        className="invoice-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaFileInvoice /> Lihat Invoice DP
                      </a>
                    </p>
                  )}
                  {order.invoiceUrlPelunasan && (
                    <p>
                      <a
                        href={`http://localhost:5000${order.invoiceUrlPelunasan}`}
                        className="invoice-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FaFileInvoice /> Lihat Invoice Pelunasan
                      </a>
                    </p>
                  )}
                </div>
                <div className="card-footer">
                  {!isBatal && !isMenungguPembatalan && order.status_pembayaran_detail === 'Menunggu Validasi' ? (
                    <span className="info-message payment-pending">
                      <FaHourglassHalf /> Pembayaran sedang divalidasi...
                    </span>
                  ) : !isBatal && !isMenungguPembatalan && order.status_pembayaran_detail === 'Lunas' ? (
                    <span className="info-message payment-complete">
                      <FaCheckCircle /> Pesanan sudah Selesai!
                    </span>
                  ) : !isBatal && !isMenungguPembatalan && order.status_pembayaran_detail === 'Belum Dibayar' && order.sisa_tagihan > 0 ? (
                    <>
                      <button
                        className="action-btn bayar-btn"
                        onClick={() =>
                          handlePaymentAction(
                            order._id,
                            order.harga_jasa,
                            order.harga_jasa * 0.5,
                            'DP'
                          )
                        }
                      >
                        Bayar Sekarang (DP)
                      </button>
                      <button
                        className="action-btn batal-btn"
                        onClick={() => handleAjukanPembatalan(order._id)}
                      >
                        Ajukan Pembatalan
                      </button>
                    </>
                  ) : !isBatal && !isMenungguPembatalan && order.status_pembayaran_detail === 'DP Terbayar' && order.sisa_tagihan > 0 ? (
                    <button
                      className="action-btn pelunasan-btn"
                      onClick={() =>
                        handlePaymentAction(
                          order._id,
                          order.harga_jasa,
                          order.sisa_tagihan,
                          'Pelunasan'
                        )
                      }
                    >
                      Bayar Pelunasan
                    </button>
                  ) : isBatal ? (
                    <span className="info-message">Pesanan Telah Dibatalkan.</span>
                  ) : isMenungguPembatalan ? (
                    <span className="info-message waiting-cancel">Menunggu Persetujuan Admin untuk Pembatalan</span>
                  ) : null}
                </div>
              </div>
            );
          })}

            {showCancelModal && (
            <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3>Ajukan Pembatalan</h3>
                <textarea
                  placeholder="Masukkan alasan pembatalan..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="modal-textarea"
                />
                <div className="modal-actions">
                  <button onClick={() => setShowCancelModal(false)} className="modal-cancel">
                    Batal
                  </button>
                  <button onClick={submitPembatalan} className="modal-submit">
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
        ) : (
          <p className="no-orders">Anda belum memiliki pesanan aktif.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
