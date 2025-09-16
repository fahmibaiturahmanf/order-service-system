import { jwtDecode } from "jwt-decode"; // Pastikan Anda menginstal jwt-decode: npm install jwt-decode

// Kunci unik untuk token dan data user per peran di localStorage
const AUTH_TOKEN_KEYS = {
    user: "authToken_user",
    admin: "authToken_admin",
    direktur: "authToken_direktur",
};
const USER_DATA_KEYS = {
    user: "userData_user",
    admin: "userData_admin",
    direktur: "userData_direktur",
};

/**
 * Mengambil token dari localStorage untuk peran spesifik.
 * @param {string} [role='user'] - Peran pengguna yang ingin diambil tokennya (misal: 'user', 'admin', 'direktur').
 * @returns {string|null} Token JWT atau null jika tidak ada.
 */
export const getToken = (role = 'user') => {
    const key = AUTH_TOKEN_KEYS[role];
    if (!key) {
        // console.warn(`getToken: Peran '${role}' tidak dikenal. Mengembalikan null.`); // Nonaktifkan jika terlalu banyak log
        return null;
    }
    return localStorage.getItem(key);
};

/**
 * Mendapatkan data user yang tersimpan di localStorage untuk peran spesifik.
 * @param {string} [role='user'] - Peran pengguna yang ingin diambil datanya.
 * @returns {object|null} Objek user atau null.
 */
export const getUserData = (role = 'user') => {
    const key = USER_DATA_KEYS[role];
    if (!key) {
        // console.warn(`getUserData: Peran '${role}' tidak dikenal. Mengembalikan null.`); // Nonaktifkan jika terlalu banyak log
        return null;
    }
    const userDataString = localStorage.getItem(key);
    try {
        return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
        console.error(`ERROR: Gagal parsing user data untuk peran '${role}' dari localStorage:`, error);
        localStorage.removeItem(key); // Hapus data yang rusak
        // Coba hapus juga tokennya jika data user rusak
        localStorage.removeItem(AUTH_TOKEN_KEYS[role]);
        return null;
    }
};

/**
 * Menghapus semua data otentikasi dari semua peran.
 * Dipanggil untuk logout global.
 */
export const clearAllAuthData = () => {
    console.warn("=== clearAllAuthData() dipanggil! (LOGOUT GLOBAL) ===");
    console.trace("Call stack for clearAllAuthData:"); // Berguna untuk debugging
    // Menghapus semua token
    Object.values(AUTH_TOKEN_KEYS).forEach(key => localStorage.removeItem(key));
    // Menghapus semua data user
    Object.values(USER_DATA_KEYS).forEach(key => localStorage.removeItem(key));
    console.warn("Semua data otentikasi berhasil dihapus dari localStorage.");
    const event = new Event('authDataChanged');
    window.dispatchEvent(event);
};

/**
 * Menghapus data otentikasi untuk peran spesifik dari localStorage.
 * Fungsi ini harus dipanggil saat logout untuk peran tertentu.
 * @param {string} role - Peran pengguna yang ingin dihapus datanya (misal: 'user', 'admin', 'direktur').
 */
export const clearSpecificAuthData = (role) => {
    console.log(`clearSpecificAuthData: Fungsi ini dipanggil untuk peran '${role}'`);
    const tokenKey = AUTH_TOKEN_KEYS[role];
    const userKey = USER_DATA_KEYS[role];
    if (tokenKey) { 
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        console.warn(`--- clearSpecificAuthData() berhasil menghapus data untuk peran '${role}'! ---`);
    } else {
        console.warn(`clearSpecificAuthData: Peran '${role}' tidak dikenal. Tidak ada data yang dihapus.`);
    }
};

/**
 * Menyimpan token dan data user ke localStorage berdasarkan perannya.
 * Ini harus dipanggil saat login berhasil.
 * PENTING: Fungsi ini TIDAK AKAN membersihkan token peran lain, memungkinkan multi-login.
 * @param {string} token - Token JWT yang akan disimpan.
 * @param {object} userData - Objek user (misal: { _id, name, email, role }). HARUS memiliki properti 'role'.
 */
export const setAuthData = (token, userData) => {
    const role = userData?.role;
    if (!role || !AUTH_TOKEN_KEYS[role]) {
        console.error("ERROR: setAuthData: Peran pengguna tidak valid atau tidak ditemukan di AUTH_TOKEN_KEYS.", userData);
        return; 
    }

    localStorage.setItem(AUTH_TOKEN_KEYS[role], token);
    localStorage.setItem(USER_DATA_KEYS[role], JSON.stringify(userData));
    console.log(`INFO: Data otentikasi berhasil disimpan untuk peran '${role}'.`);
    const event = new Event('authDataChanged');
    window.dispatchEvent(event);
};

/**
 * Memeriksa status otentikasi pengguna dan perannya.
 * Fungsi ini akan mencari token yang valid di antara semua peran yang mungkin.
 * @param {string|string[]|null} expectedRoles - Peran yang diharapkan untuk otentikasi (misal: 'admin', ['admin', 'direktur']).
 * Jika null atau undefined, fungsi akan mencari peran manapun yang terotentikasi.
 * @returns {{isAuthenticated: boolean, userRole: string|null, isTokenValid: boolean, isRoleMatched: boolean, currentAuthRole: string|null, userData: object|null}}
 * currentAuthRole: Menyatakan peran mana yang saat ini terautentikasi dan valid.
 * userData: Mengembalikan objek user yang terkait dengan token yang valid.
 */
export const getAuthStatus = (expectedRoles = null) => {
    let currentAuthRole = null;
    let isAuthenticated = false;
    let userRoleFromToken = null;
    let isTokenValid = false;
    let isRoleMatched = false;
    let activeUserData = null; 

    // Konversi expectedRoles menjadi array untuk penanganan yang konsisten
    const rolesToCheck = expectedRoles ? (Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles]) : [];

    console.log(`DEBUG: getAuthStatus() dipanggil dengan expectedRoles: ${JSON.stringify(expectedRoles)} (actual check roles: ${JSON.stringify(rolesToCheck)})`);

    // Prioritaskan peran yang diharapkan jika ada, atau periksa semua
    const rolesToIterate = rolesToCheck.length > 0 ? rolesToCheck : Object.keys(AUTH_TOKEN_KEYS);

    for (const roleKey of rolesToIterate) {
        const tokenKey = AUTH_TOKEN_KEYS[roleKey];
        const userDataKey = USER_DATA_KEYS[roleKey];

        // Jika kunci peran tidak ditemukan, lewati
        if (!tokenKey || !userDataKey) {
            console.warn(`WARN: Kunci otentikasi untuk peran '${roleKey}' tidak terdefinisi.`);
            continue;
        }

        const token = localStorage.getItem(tokenKey);
        const userDataString = localStorage.getItem(userDataKey);

        if (token) {
            console.log(`DEBUG: Memeriksa token untuk peran '${roleKey}'.`);
            try {
                const decoded = jwtDecode(token);
                const now = Date.now() / 1000;

                // Periksa apakah token sudah kadaluarsa
                if (decoded.exp < now) {
                    console.warn(`WARNING: Token untuk peran '${roleKey}' kadaluarsa. Menghapus data.`);
                    clearSpecificAuthData(roleKey); // Gunakan fungsi helper
                    continue; // Lanjutkan ke peran berikutnya
                }

                // Validasi role di token dengan data user di localStorage
                let parsedUserData = null;
                try {
                    parsedUserData = userDataString ? JSON.parse(userDataString) : null;
                } catch (parseError) {
                    console.error(`ERROR: Gagal parsing data user untuk peran '${roleKey}'. Menghapus data.`, parseError);
                    clearSpecificAuthData(roleKey);
                    continue;
                }

                if (!parsedUserData) { // Jika data user tidak ada setelah token divalidasi
                    console.warn(`WARNING: Data user tidak ditemukan untuk peran '${roleKey}'. Menghapus token terkait.`);
                    clearSpecificAuthData(roleKey);
                    continue;
                }

                if (decoded.role !== parsedUserData.role) {
                    console.warn(`WARNING: Peran di token ('${decoded.role}') tidak cocok dengan data user ('${parsedUserData?.role}') untuk peran '${roleKey}'. Menghapus data.`);
                    clearSpecificAuthData(roleKey);
                    continue;
                }

                // Jika token valid, belum kadaluarsa, dan data konsisten
                isTokenValid = true;
                userRoleFromToken = decoded.role;
                currentAuthRole = roleKey; 
                activeUserData = parsedUserData; 

                // Periksa kesesuaian peran jika expectedRoles disediakan
                if (rolesToCheck.length > 0) {
                    isRoleMatched = rolesToCheck.includes(userRoleFromToken);
                    console.log(`DEBUG: Peran diharapkan: ${rolesToCheck.join(', ')}. Peran dari token: ${userRoleFromToken}. Cocok: ${isRoleMatched}.`);
                } else {
                    isRoleMatched = true; 
                    console.log(`DEBUG: Tidak ada peran yang diharapkan. Peran dari token: ${userRoleFromToken}. Otentikasi OK.`);
                }

                if (isTokenValid && isRoleMatched) {
                    isAuthenticated = true;
                    console.log(`SUCCESS: Ditemukan token valid dan peran cocok untuk '${roleKey}'. Otentikasi: TRUE.`);
                    const finalValidResult = { isAuthenticated, userRole: userRoleFromToken, isTokenValid, isRoleMatched, currentAuthRole, userData: activeUserData };
                    console.log(`DEBUG_RETURN: getAuthStatus for expectedRoles "${JSON.stringify(expectedRoles)}" returning: ${JSON.stringify(finalValidResult)}`);
                    return finalValidResult;
                }

            } catch (error) {
                console.error(`ERROR: Token untuk peran '${roleKey}' tidak valid atau rusak:`, error);
                clearSpecificAuthData(roleKey); 
            }
        }
    }

    // Jika loop selesai dan tidak ada token yang valid atau cocok dengan expectedRoles
    const finalResult = { isAuthenticated, userRole: userRoleFromToken, isTokenValid, isRoleMatched, currentAuthRole, userData: activeUserData };
    console.log(`RESULT: getAuthStatus() mengembalikan: ${JSON.stringify(finalResult)}`);
    return finalResult;
};