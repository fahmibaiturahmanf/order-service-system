import React, { useEffect, useState } from 'react';
import './serviceList.css';
import axios from 'axios';
import { getToken } from '../../utils/auth';

function ServiceList() {
  const [jasaList, setJasaList] = useState([]);
  const [editJasa, setEditJasa] = useState(null); 
  const [formData, setFormData] = useState({
    nama_jasa: '',
    deskripsi_jasa: '',
    alat_dan_bahan: '',
    durasi_jasa: '',
    harga_jasa: ''
  });

  const token = getToken('admin');

  const fetchJasa = async () => {
    try {
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/jasa-admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJasaList(res.data);
    } catch (err) {
      console.error('Gagal mengambil data jasa:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jasa ini?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jasa-admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJasaList(jasaList.filter((j) => j._id !== id));
    } catch (err) {
      console.error('Gagal menghapus jasa:', err);
    }
  };

  const openEditModal = (jasa) => {
    setEditJasa(jasa);
    setFormData({
      nama_jasa: jasa.nama_jasa,
      deskripsi_jasa: jasa.deskripsi_jasa,
      alat_dan_bahan: jasa.alat_dan_bahan,
      durasi_jasa: jasa.durasi_jasa,
      harga_jasa: jasa.harga_jasa
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/jasa-admin/${editJasa._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditJasa(null);
      fetchJasa();
    } catch (err) {
      console.error('Gagal memperbarui jasa:', err);
    }
  };

  useEffect(() => {
    fetchJasa();
  }, []);

  return (
    <div className="service-list-container">
      <h2>Kelola Jasa</h2>
      <div className="service-cards-grid">
        {jasaList.length > 0 ? (
          jasaList.map((jasa) => (
            <div key={jasa._id} className="service-card">
              <h3>{jasa.nama_jasa}</h3>
              <p>{jasa.deskripsi_jasa?.substring(0, 150)}...</p>
              <p className="jasa-info">
                Alat & Bahan: {jasa.alat_dan_bahan || 'tbc'} <br />
                Durasi: {jasa.durasi_jasa || 'tbc'} <br />
                Harga: Rp {jasa.harga_jasa?.toLocaleString()}
              </p>
              <div className="service-actions">
                <button className="edit-button" onClick={() => openEditModal(jasa)}>Edit</button>
                <button className="delete-button" onClick={() => handleDelete(jasa._id)}>Hapus</button>
              </div>
            </div>
          ))
        ) : (
          <p>Belum ada data jasa.</p>
        )}
      </div>

      {editJasa && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Jasa</h3>
            <form onSubmit={handleEditSubmit}>
              <input type="text" value={formData.nama_jasa} onChange={(e) => setFormData({ ...formData, nama_jasa: e.target.value })} required />
              <textarea value={formData.deskripsi_jasa} onChange={(e) => setFormData({ ...formData, deskripsi_jasa: e.target.value })} required />
              <input type="text" value={formData.alat_dan_bahan} onChange={(e) => setFormData({ ...formData, alat_dan_bahan: e.target.value })} />
              <input type="text" value={formData.durasi_jasa} onChange={(e) => setFormData({ ...formData, durasi_jasa: e.target.value })} />
              <input type="number" value={formData.harga_jasa} onChange={(e) => setFormData({ ...formData, harga_jasa: e.target.value })} required />
              <div style={{ marginTop: '10px' }}>
                <button type="submit" className="edit-button">Simpan</button>
                <button type="button" className="delete-button" onClick={() => setEditJasa(null)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceList;
