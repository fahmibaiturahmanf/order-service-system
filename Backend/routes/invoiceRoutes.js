const express = require('express');
const router = express.Router();
const { generateInvoice } = require('../controllers/invoiceController');

router.post('/generate-invoice/:id', generateInvoice);

module.exports = router;
