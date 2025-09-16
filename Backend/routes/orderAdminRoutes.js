const express = require('express');
const router = express.Router();
const pemesananController = require ('../controllers/pemesananController');
const { authenticate, authorizeRole } = require ('../Middleware/authMiddleware'); 

router.get('/orders', authenticate, authorizeRole(['admin']), pemesananController.getAllPemesanan);


module.exports = router;
