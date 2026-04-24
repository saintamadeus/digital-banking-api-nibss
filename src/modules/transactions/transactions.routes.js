const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const {
  nameEnquiry,
  transfer,
  getTransactionStatus,
  getTransactionHistory,
} = require('./transactions.controller');

router.get('/name-enquiry/:accountNumber', authenticate, nameEnquiry);
router.post('/transfer', authenticate, transfer);
router.get('/status/:ref', authenticate, getTransactionStatus);
router.get('/history', authenticate, getTransactionHistory);

module.exports = router;