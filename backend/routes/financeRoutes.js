// backend/finance.js
const express = require('express');
const router = express.Router();
const finance = require('../controller/financeController.js');

// 費用管理
router.post('/fees', finance.createFee);
router.get('/fees', finance.getAllFees);
router.get('/fees/simple', finance.getSimpleFees);

// 繳費管理
router.post('/payments', finance.addPayment);
router.get('/members/:studentId/payments', finance.getPersonalPayments);
router.get('/fees/:feeId/status', finance.getPaymentStatus);

module.exports = router;
