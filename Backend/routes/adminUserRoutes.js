// routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware');

router.get('/', authenticate, authorizeRole(['admin']), adminUserController.getAllUsers);

module.exports = router;
