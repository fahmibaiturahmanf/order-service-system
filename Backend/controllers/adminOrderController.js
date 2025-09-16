const Order = require('../models/Order');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user_id', 'name email no_telepon') // Ambil nama, email, dan telepon dari user terkait
      .sort({ created_at: -1 });

    res.status(200).json({ pemesanans: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Gagal mengambil data', error });
  }
};

module.exports = {
  getAllOrders
};
