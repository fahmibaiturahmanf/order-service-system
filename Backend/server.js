const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// =========================
// Middleware Global
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Static File Serving
// =========================
const uploadsPath = path.resolve(__dirname, 'uploads');
const publicPath = path.resolve(__dirname, 'public');
const invoicesPath = path.join(uploadsPath, 'invoices');

// ✅ Log path untuk memastikan
console.log('📂 Serving uploads from:', uploadsPath);
console.log('📂 Serving public from:', publicPath);

// ✅ Pastikan folder PDF invoice bisa diakses
app.use('/uploads', express.static(uploadsPath)); // untuk akses /uploads/invoices/namafile.pdf
app.use(express.static(publicPath));

// =========================
// Setup EJS (View Engine)
// =========================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // <- ✅ ini harus "views", bukan "templates"

// =========================
// Koneksi ke MongoDB
// =========================
connectDB();

// =========================
// Middleware Auth
// =========================
const { authenticate, authorizeRole } = require('./Middleware/authMiddleware');

// =========================
// Import Semua Routes
// =========================
const userAuthRoutes = require('./routes/userAuthRoutes');
const adminAuthRoutes = require('./routes/adminAuth'); 
const direkturAuthRoutes = require('./routes/direkturRoutes');
const userPemesananRoutes = require('./routes/userPemesananRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const jasaRoutes = require('./routes/jasaRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');
const adminManagementRoutes = require('./routes/adminManagement');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminInvoiceRoutes = require('./routes/adminInvoiceRoute');
const adminRecapRoutes = require('./routes/adminRecapRoute'); 
const direkturDashboardRoute = require('./routes/direkturDashboardRoute');
const direkturOrderRoute = require('./routes/direkturOrderRoute');
const direkturRecapRoute = require('./routes/direkturRecapRoute');
const userNotificationRoutes = require('./routes/userNotificationRoutes');
const adminJasaRoutes = require('./routes/adminJasaRoute');
const userJasaRoutes = require('./routes/userJasaRoutes'); 

// =========================
// Routing API
// =========================
app.use('/api/auth', userAuthRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/direktur', direkturAuthRoutes);
app.use('/api/user-pemesanan', authenticate, authorizeRole(['user']), userPemesananRoutes);
app.use('/api/admin-dashboard', authenticate, authorizeRole(['admin']), adminDashboardRoutes);
app.use('/api/direktur-dashboard', authenticate, authorizeRole(['direktur']), direkturDashboardRoute);
app.use('/api/direktur-orders', direkturOrderRoute);
app.use('/api/direktur-recap', authenticate, authorizeRole(['direktur']), direkturRecapRoute);
app.use('/api/admin-invoices', authenticate, authorizeRole(['admin']), adminInvoiceRoutes);
app.use('/api/jasa', authenticate, authorizeRole(['user', 'admin', 'direktur']), jasaRoutes);
app.use('/api/jasa-admin', adminJasaRoutes); 
app.use('/api/jasa-user', userJasaRoutes); 
app.use('/api/pembayaran', authenticate, authorizeRole(['user', 'admin', 'direktur']), pembayaranRoutes);
app.use('/api/admin/users', authenticate, authorizeRole(['admin']), adminUserRoutes);
app.use('/api/admin/management', authenticate, authorizeRole(['admin']), adminManagementRoutes);
app.use('/api/admin-recap', authenticate, authorizeRole(['admin', 'direktur']), adminRecapRoutes);
app.use('/api/notifications', userNotificationRoutes);

// =========================
// Tes Endpoint
// =========================
app.get('/', (req, res) => {
  res.send('✅ Halo dari Backend!');
});

// =========================
// Start Server
// =========================
app.listen(port, () => {
  console.log(`🚀 Server backend aktif di: http://localhost:${port}`);
});
