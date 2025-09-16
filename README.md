# Order Service System

Sistem Informasi Pemesanan Jasa Instalasi dan Piping Non-Metal  
**Studi Kasus: PT. Eco Metalindo Indonesia**

---

## 📌 Deskripsi
Website ini dikembangkan sebagai bagian dari skripsi untuk mempermudah proses pemesanan jasa instalasi dan piping non-metal.  
Sistem ini menyediakan fitur:
- Pemesanan jasa secara online
- Upload bukti pembayaran
- Notifikasi status pesanan
- Rekap data bulanan untuk admin dan direktur
- Generate invoice dalam bentuk PDF

---

## 🚀 Tech Stack
- **Frontend:** React.js, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Metodologi:** Agile Scrum

---

## ⚙️ Instalasi & Menjalankan Project
1. Clone repositori:
   ```bash
   git clone https://github.com/fahmibaiturahmanf/order-service-system.git

   ## Setup Backend

2. Setup Backend
 Masuk ke folder **Backend**:
   ```bash
cd Backend - npm install. 
Buat file .env di dalam folder Backend:
PORT=5000
MONGO_URI=mongodb://localhost:27017/order-service-system
JWT_SECRET=your_jwt_secret
Jalankan server backend:
npm start

3. Setup Frontend
Masuk ke folder frontend:
cd frontend
Install dependency:
npm install
Jalankan aplikasi React:
npm start

Akun Dummy untuk Testing
Untuk mempermudah pengujian, gunakan akun berikut:
User
Username: user1@gmail.com
Password: 123456

Admin
Username: admin1
Password: 123456

Direktur
Username: direktur1
Password: 123456

Fitur Utama
1. User :
Registrasi & login
Pemesanan jasa instalasi & piping
Upload bukti pembayaran
Notifikasi status pesanan
Riwayat pesanan (download invoice PDF)

2. Admin :
Validasi pembayaran
Kelola daftar pesanan
Generate invoice
Rekap data bulanan

3. Direktur :
Akses rekap pesanan bulanan
Laporan keuangan berdasarkan status & tanggal selesa



