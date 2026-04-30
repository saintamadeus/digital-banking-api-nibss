const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { transferLimiter } = require('../../middleware/rateLimiter');
const {
  nameEnquiry,
  transfer,
  getTransactionStatus,
  getTransactionHistory,
} = require('./transactions.controller');

router.get('/name-enquiry/:accountNumber', authenticate, nameEnquiry);
router.post('/transfer', authenticate, transferLimiter, transfer);
router.get('/status/:ref', authenticate, getTransactionStatus);
router.get('/history', authenticate, getTransactionHistory);

module.exports = router;