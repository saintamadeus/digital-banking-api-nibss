const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { createAccount, getBalance } = require('./accounts.controller');

router.post('/create', authenticate, createAccount);
router.get('/balance', authenticate, getBalance);

module.exports = router;