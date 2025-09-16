const express = require('express');
const router = express.Router();
const { getAllJasaForUser } = require('../controllers/userJasaController');

// Route GET /api/jasa — publik, bisa diakses tanpa login
router.get('/', getAllJasaForUser);

module.exports = router;
