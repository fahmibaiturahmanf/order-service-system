const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login Admin
const loginAdmin = async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();

    try {
        const admin = await Admin.findOne({
            username: { $regex: new RegExp(`^${username}$`, 'i') }, // case-insensitive
        });
        if (!admin) {
            console.log("ADMIN_LOGIN failed: Username not found:", username);
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            console.log("ADMIN_LOGIN failed: Invalid password for admin:", username);
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const secretKey = process.env.JWT_SECRET || 'secretkey';
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            secretKey,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                phone: admin.phone,
                alamat: admin.alamat,
                username: admin.username,
            },
        });
    } catch (error) {
        console.error('Error saat login admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Register Admin
const createAdmin = async (req, res) => {
    const { name, email, password, phone, alamat, username } = req.body; // Tambahkan username jika ada

    console.log('ADMIN_REGISTER: Data registrasi diterima:', req.body);

    try {
        // REVISI: Normalisasi email saat register juga
        const normalizedEmail = email.toLowerCase().trim();
        const existingAdmin = await Admin.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email sudah digunakan' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email: normalizedEmail, // Gunakan email yang sudah dinormalisasi
            password: hashedPassword,
            phone,
            alamat,
            username, // Tambahkan username jika ada di body
            role: 'admin',
        });

        console.log('ADMIN_REGISTER: Admin yang akan disimpan:', admin);
        await admin.save();
        console.log('ADMIN_REGISTER: Admin berhasil disimpan:', admin);

        res.status(201).json({ message: 'Admin berhasil dibuat', admin });
    } catch (error) {
        console.error('ADMIN_REGISTER ERROR: Terjadi kesalahan server:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

const getAllAdmin = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password -token_login');
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error saat mendapatkan semua admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Logout Admin (lebih banyak penanganan di sisi client)
const logoutAdmin = (req, res) => {
    res.status(200).json({ message: 'Logout berhasil' });
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        // REVISI: Mengambil ID dari req.user.id yang diset oleh middleware
        const adminId = req.user.id; // Asumsikan middleware menyetel req.user.id

        // Cari admin berdasarkan ID, tidak perlu cek req.user lagi
        const admin = await Admin.findById(adminId).select('-password -token_login');
        
        if (!admin) {
            console.warn("ADMIN_PROFILE: Profil admin tidak ditemukan untuk ID:", adminId);
            return res.status(404).json({ message: 'Profil admin tidak ditemukan' });
        }

        console.log("ADMIN_PROFILE: Mengirim data profil admin untuk ID:", adminId);
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error saat mendapatkan profil admin:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};


module.exports = {
    loginAdmin,
    createAdmin,
    getAllAdmin,
    logoutAdmin,
    getAdminProfile,
};
