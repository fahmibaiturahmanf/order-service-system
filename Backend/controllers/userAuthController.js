// controllers/userAuthController.js
const User = require('../models/User');
const ResetPassword = require('../models/ResetPassword');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Konfigurasi transporter untuk pengiriman email menggunakan Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '212210032@student.ibik.ac.id',
        pass: 'lmos oytf bclj rvap',
    },
    tls: {
        rejectUnauthorized: false, // Jangan gunakan di production (tidak aman)
    },
});

// ============================================
// Fungsi untuk mengirim pesan dari form meeting
// ============================================
const kirimEmailMeeting = async (req, res) => {
    const { email, nama, alamat, telepon, pesan } = req.body;

    const mailOptions = {
        from: '212210032@student.ibik.ac.id',
        to: '212210032@student.ibik.ac.id', 
        subject: 'Pesan dari Form Meeting Website',
        html: `
            <h3>Pesan Baru dari Form Meeting</h3>
            <p><strong>Email Pengirim:</strong> ${email}</p>
            <p><strong>Nama:</strong> ${nama}</p>
            <p><strong>Alamat:</strong> ${alamat}</p>
            <p><strong>No. Telepon:</strong> ${telepon}</p>
            <p><strong>Isi Pesan:</strong><br/>${pesan}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Pesan berhasil dikirim!' });
    } catch (error) {
        console.error('Gagal mengirim pesan dari form meeting:', error);
        res.status(500).json({ message: 'Gagal mengirim pesan.' });
    }
};

// ============================================
// Fungsi untuk login user
// ============================================
const loginUser = async (req, res) => {
    console.log("loginUser controller invoked!");
    let { username, password } = req.body;

    username = username.trim();

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan' });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                alamat: user.alamat,
                username: user.username,
            },
        });
    } catch (error) {
        console.error('Error saat login user:', error);
        res.status(500).json({ message: 'Login gagal', error: error.message });
    }
};

// ============================================
// Fungsi untuk registrasi user baru
// ============================================
const registerUser = async (req, res) => {
    const { username, password, phone, email, displayName, fullAddress } = req.body;

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: displayName,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            alamat: fullAddress,
            username,
            role: 'user',
        });

        await newUser.save();
        res.status(201).json({ message: 'Registrasi berhasil' });
    } catch (error) {
        console.error('REGISTER ERROR:', error.message);
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Data registrasi tidak valid.', details: errors });
        }
        res.status(500).json({ message: 'Gagal mendaftarkan user', error: error.message });
    }
};

// ============================================
// Fungsi untuk membuat permintaan reset password (mengirim email berisi token reset)
// ============================================
const resetPasswordRequestUser = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(200).json({ message: 'Permintaan reset password berhasil dikirim jika email terdaftar.' });

        await ResetPassword.deleteMany({ user_id: user._id });

        const resetToken = crypto.randomBytes(20).toString('hex');
        const newReset = new ResetPassword({ user_id: user._id, token: resetToken });
        await newReset.save();

        const resetUrl = `http://localhost:5173/resetpass-form?token=${resetToken}`;
        const mailOptions = {
            from: '212210032@student.ibik.ac.id',
            to: user.email,
            subject: 'Permintaan Reset Password',
            html: `
                Anda menerima email ini karena ada permintaan untuk reset password akun Anda.<br><br>
                Klik tautan berikut untuk mengatur ulang password Anda:<br>
                <a href="${resetUrl}">${resetUrl}</a><br><br>
                Jika Anda tidak meminta reset ini, abaikan email ini.
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Gagal kirim email reset:', error);
                return res.status(500).json({ message: 'Gagal mengirim email.' });
            }
            res.status(200).json({ message: 'Permintaan reset berhasil dikirim.' });
        });
    } catch (error) {
        console.error('Error saat request reset:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

// ============================================
// Fungsi untuk mereset password user berdasarkan token
// ============================================
const resetPasswordUser = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const resetRecord = await ResetPassword.findOne({ token });
        if (!resetRecord) return res.status(400).json({ message: 'Token tidak valid' });

        const user = await User.findById(resetRecord.user_id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await ResetPassword.deleteOne({ token }); // Hapus token setelah digunakan

        res.status(200).json({ message: 'Password berhasil direset.' });
    } catch (error) {
        console.error('Error saat reset password:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    resetPasswordRequestUser,
    resetPasswordUser,
    kirimEmailMeeting, 
};
