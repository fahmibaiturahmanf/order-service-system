const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eco_service_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Terhubung ke MongoDB');
  } catch (error) {
    console.error('❌ Gagal koneksi ke MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;