// File: Backend/controllers/direkturController.js
const Direktur = require('../models/Direktur');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fungsi untuk Login Direktur
const loginDirektur = async (req, res) => {
    let { username, password } = req.body;
    username = username.trim(); // Normalisasi spasi
    console.log("DIREKTUR_LOGIN: Attempting to find direktur with username:", username);

    try {
        const direktur = await Direktur.findOne({ username });
        if (!direktur) {
            console.log("DIREKTUR_LOGIN failed: Username not found:", username);
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, direktur.password);
        if (!isPasswordMatch) {
            console.log("DIREKTUR_LOGIN failed: Invalid password for direktur:", username);
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            console.error('DIREKTUR_LOGIN ERROR: JWT_SECRET tidak didefinisikan!');
            return res.status(500).json({ message: 'Terjadi kesalahan server: Konfigurasi JWT tidak ditemukan.' });
        }

        const token = jwt.sign(
            { id: direktur._id, username: direktur.username, role: direktur.role },
            secretKey,
            { expiresIn: '8h' }
        );

        console.log("DIREKTUR_LOGIN successful for direktur:", username); // ✅ Sudah benar

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: direktur._id,
                name: direktur.name,
                email: direktur.email,
                role: direktur.role,
                phone: direktur.phone,
                alamat: direktur.alamat,
                username: direktur.username,
            },
        });
    } catch (error) {
        console.error('Error saat login direktur:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};


// Fungsi untuk Register Direktur
const createDirektur = async (req, res) => {
    const { name, email, password, phone, alamat, username } = req.body;

    console.log("DIREKTUR_REGISTER: Data registrasi diterima:", req.body);

    try {
        // REVISI: Normalisasi email saat register juga
        const normalizedEmail = email.toLowerCase().trim();
        const existingDirektur = await Direktur.findOne({ email: normalizedEmail });
        if (existingDirektur) {
            return res.status(400).json({ message: 'Email sudah digunakan.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const direktur = new Direktur({
            username,
            name,
            email: normalizedEmail, // Gunakan email yang sudah dinormalisasi
            password: hashedPassword,
            phone,
            alamat,
            role: 'direktur',
        });

        console.log('DIREKTUR_REGISTER: Direktur yang akan disimpan:', direktur);
        await direktur.save();
        console.log('DIREKTUR_REGISTER: Direktur berhasil disimpan:', direktur);

        res.status(201).json({
            message: 'Direktur berhasil dibuat', direktur: {
                id: direktur._id,
                username: direktur.username,
                name: direktur.name,
                email: direktur.email,
                phone: direktur.phone,
                alamat: direktur.alamat,
                role: direktur.role
            }
        });
    } catch (error) {
        console.error('Error saat membuat direktur:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Fungsi untuk Get All Direktur (hanya contoh, mungkin perlu perlindungan admin)
const getAllDirektur = async (req, res) => {
    try {
        const direkturs = await Direktur.find().select('-password -token_login');
        res.status(200).json(direkturs);
    } catch (error) {
        console.error('Error saat mendapatkan semua direktur:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Fungsi untuk Logout Direktur (lebih banyak penanganan di sisi client)
const logoutDirektur = (req, res) => {
    res.status(200).json({ message: 'Logout berhasil' });
};

// Fungsi untuk Get Direktur Profile (Menggunakan ID dari token JWT)
const getDirekturProfile = async (req, res) => {
    try {
        // req.user datang dari middleware verifyToken
        // REVISI: Mengambil ID dari req.user.id yang diset oleh middleware
        const direkturId = req.user.id; // Asumsikan middleware menyetel req.user.id

        const direktur = await Direktur.findById(direkturId).select('-password -token_login');

        if (!direktur) {
            console.warn("DIREKTUR_PROFILE: Profil direktur tidak ditemukan untuk ID:", direkturId);
            return res.status(404).json({ message: 'Profil direktur tidak ditemukan' });
        }

        console.log("DIREKTUR_PROFILE: Mengirim data profil direktur untuk ID:", direkturId);
        res.status(200).json(direktur);
    } catch (error) {
        console.error('Error saat mendapatkan profil direktur:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// Fungsi untuk Get Direktur Dashboard Data (YANG HILANG)
const getDirekturDashboardData = async (req, res) => {
    try {
        res.status(200).json({
            message: "Data dashboard direktur berhasil dimuat",
            dashboardData: {
                totalPemesanan: 500,
                pendingValidasi: 20,
                totalPendapatan: 150000000,
                grafikBulanan: [ /* data grafik */ ]
            }
        });
    } catch (error) {
        console.error('Error saat mendapatkan data dashboard direktur:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server saat memuat data dashboard.' });
    }
};

module.exports = {
    loginDirektur,
    createDirektur,
    getAllDirektur,
    logoutDirektur,
    getDirekturProfile,
    getDirekturDashboardData,
};
