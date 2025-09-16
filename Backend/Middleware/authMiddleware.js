const jwt = require("jsonwebtoken");
const User = require('../models/User'); // Pastikan path ini benar
const Admin = require('../models/admin'); // Pastikan path ini benar
const Direktur = require('../models/Direktur'); // Pastikan path ini benar

/**
 * Middleware untuk mengautentikasi token JWT.
 * Mengambil token, memverifikasi, dan melampirkan objek user (lengkap dengan role) ke req.user.
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Authenticate: Tidak ada token atau format tidak valid. Mengembalikan 401.");
        return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan atau format tidak valid." });
    }

    const token = authHeader.split(' ')[1];
    console.log("Authenticate: Token diterima. Panjang:", token.length);

    try {
        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            console.error("Server error: JWT_SECRET tidak ditemukan di environment variables.");
            return res.status(500).json({ message: "Server error: Secret key tidak ditemukan." });
        }

        const verified = jwt.verify(token, secretKey);
        console.log("Authenticate: Token berhasil diverifikasi. Payload:", verified);

        // REVISI: Mengambil ID dan Role secara universal dari payload
        const userIdFromToken = verified.id; // Sekarang kita tahu ID selalu ada di kunci 'id'
        const roleFromToken = verified.role; // Role juga ada di payload

        let foundUser = null;

        // Mencari user berdasarkan role dari token
        if (roleFromToken === 'admin') {
            console.log("Authenticate: Mencoba menemukan Admin dengan ID:", userIdFromToken);
            foundUser = await Admin.findById(userIdFromToken).select('-password -token_login');
        } else if (roleFromToken === 'user') {
            console.log("Authenticate: Mencoba menemukan User dengan ID:", userIdFromToken);
            foundUser = await User.findById(userIdFromToken).select('-password -token_login');
        } else if (roleFromToken === 'direktur') {
            console.log("Authenticate: Mencoba menemukan Direktur dengan ID:", userIdFromToken);
            foundUser = await Direktur.findById(userIdFromToken).select('-password -token_login');
        } else {
            console.warn("Authenticate: Role tidak dikenal di token:", roleFromToken);
            return res.status(403).json({ message: 'Token tidak valid, peran tidak dikenal.' });
        }

        if (!foundUser) {
            console.log("Authenticate: Tidak ada pengguna ditemukan di DB untuk ID dalam token. Mengembalikan 401.");
            return res.status(401).json({ message: 'Token tidak valid, pengguna tidak ditemukan.' });
        }

        // Pastikan role di objek yang ditemukan cocok dengan role di token
        if (foundUser.role !== roleFromToken) {
            console.warn(`Authenticate: Role di database ('${foundUser.role}') tidak cocok dengan role di token ('${roleFromToken}').`);
            return res.status(403).json({ message: 'Akses ditolak. Peran tidak cocok.' });
        }

        req.user = foundUser; // Melampirkan objek user/admin/direktur yang lengkap ke req.user
        console.log("Authenticate: req.user berhasil diisi dengan role:", req.user.role, "dan ID:", req.user._id);

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error("Authenticate Error: Token Kadaluarsa. Mengembalikan 401.");
            return res.status(401).json({ message: 'Sesi Anda telah berakhir. Mohon login kembali.' });
        }
        console.error("Authenticate Error: Token tidak valid. Mengembalikan 403. Pesan error:", err.message);
        return res.status(403).json({ message: "Token tidak valid. Akses ditolak." });
    }
};

/**
 * Middleware untuk mengotorisasi akses berdasarkan peran pengguna.
 * @param {Array<string>} roles - Array string peran yang diizinkan (misal: ['admin', 'direktur']).
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            console.warn(`AuthorizeRole: Akses ditolak. Pengguna '${req.user ? req.user.email : "Tidak ada pengguna"}' dengan role '${req.user ? req.user.role : "Tidak ada role"}' mencoba mengakses rute yang memerlukan peran: ${roles.join(', ')}`);
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.' });
        }
        console.log(`AuthorizeRole: Akses diberikan untuk role '${req.user.role}'.`);
        next();
    };
};

module.exports = { authenticate, authorizeRole };
