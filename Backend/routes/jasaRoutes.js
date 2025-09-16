const express = require('express');
const router = express.Router();
const jasaController = require('../controllers/jasaController');

router.post('/jasa', jasaController.createJasa);
router.get('/jasa', jasaController.getAllJasa);

module.exports = router;