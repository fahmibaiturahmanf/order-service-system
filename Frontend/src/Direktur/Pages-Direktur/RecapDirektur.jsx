import React, { useState, useEffect } from 'react';
import './recapDirektur.css';
import axiosInstance from '../../utils/axiosInstance';

function RecapDirektur() {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const now = new Date();
        setMonth((now.getMonth() + 1).toString());
        setYear(now.getFullYear().toString());
    }, []);

    const handleGeneratePdf = async () => {
        if (!month || !year) {
            setMessage('Mohon pilih bulan dan tahun terlebih dahulu.');
            setMessageType('error');
            return;
        }

        setMessage('Sedang membuat PDF... Mohon tunggu.');
        setMessageType('info');

        try {
            const response = await axiosInstance.get(`/direktur-recap/generate-pdf/${year}/${month}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rekap-pemesanan-${month}-${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setMessage('PDF berhasil dibuat dan diunduh!');
            setMessageType('success');
        } catch (error) {
            console.error('Gagal membuat PDF:', error);
            setMessage('Gagal membuat PDF. Silakan coba lagi.');
            setMessageType('error');
        }
    };

    const handleViewRecap = async () => {
        if (!month || !year) {
            setMessage('Mohon pilih bulan dan tahun terlebih dahulu.');
            setMessageType('error');
            return;
        }

        setMessage('Sedang membuka rekap...');
        setMessageType('info');

        try {
            const response = await axiosInstance.get(`/direktur-recap/rekap-bulanan/${year}/${month}`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

            setMessage('Rekap berhasil ditampilkan!');
            setMessageType('success');
        } catch (error) {
            console.error('Gagal membuka rekap:', error);
            setMessage('Gagal membuka rekap. Silakan coba lagi.');
            setMessageType('error');
        }
    };

    const months = [
        { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' }, { value: '4', label: 'April' },
        { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' }, { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
    ];

    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
    };

    return (
        <div className="recap-container">
            <h2>Rekap Pemesanan Bulanan</h2>

            <div className="recap-form-section">
                <div className="form-group">
                    <label htmlFor="month-select">Pilih Bulan:</label>
                    <select
                        id="month-select"
                        value={month}
                        onChange={(e) => { setMonth(e.target.value); setMessage(''); }}
                        className="recap-select"
                    >
                        <option value="">-- Pilih Bulan --</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="year-select">Pilih Tahun:</label>
                    <select
                        id="year-select"
                        value={year}
                        onChange={(e) => { setYear(e.target.value); setMessage(''); }}
                        className="recap-select"
                    >
                        <option value="">-- Pilih Tahun --</option>
                        {generateYears().map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="recap-buttons">
                    <button onClick={handleGeneratePdf} className="recap-button primary">
                        Generate PDF Rekap
                    </button>
                    <button onClick={handleViewRecap} className="recap-button secondary">
                        Lihat Rekap
                    </button>
                </div>

                {message && (
                    <div className={`recap-message ${messageType}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecapDirektur;
