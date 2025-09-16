const express = require('express');
const router = express.Router();
const direkturOrderController = require('../controllers/direkturOrderController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

// Route: hanya untuk direktur
router.get('/', authenticate, authorizeRole(['direktur']), direkturOrderController.getAllOrdersDirektur);

module.exports = router;
