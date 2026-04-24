const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { verifyBvn, verifyNin } = require('./onboarding.controller');

router.post('/bvn', authenticate, verifyBvn);
router.post('/nin', authenticate, verifyNin);

module.exports = router;