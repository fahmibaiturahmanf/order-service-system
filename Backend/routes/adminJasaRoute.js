const express = require('express');
const router = express.Router();
const {
  getAllJasa,
  createJasa,
  updateJasa,
  deleteJasa,
} = require('../controllers/adminJasaController');

// Tambahkan middleware autentikasi dan otorisasi
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

router.get('/', authenticate, authorizeRole(['admin']), getAllJasa);
router.post('/', authenticate, authorizeRole(['admin']), createJasa);
router.put('/:id', authenticate, authorizeRole(['admin']), updateJasa);
router.delete('/:id', authenticate, authorizeRole(['admin']), deleteJasa);

module.exports = router;
