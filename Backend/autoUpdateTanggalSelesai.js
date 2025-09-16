// autoUpdateTanggalSelesai.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Pemesanan = require('./models/Pemesanan');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Terhubung ke database');

  const result = await Pemesanan.updateMany(
    {
      status_pemesanan: 'Selesai',
      tanggal_selesai: { $exists: false }
    },
    [
      {
        $set: {
          tanggal_selesai: "$updated_at"
        }
      }
    ]
  );

  console.log(`${result.modifiedCount} pemesanan berhasil diupdate.`);
  process.exit();
}).catch(err => {
  console.error('Gagal konek MongoDB:', err);
  process.exit(1);
});
