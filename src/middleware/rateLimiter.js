const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../utils/constants');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: false,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    error: 'Too many login/registration attempts. Please try again later.',
  },
  standardHeaders: false,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Rate limit even on successful auth
});

// Rate limiter for transfer endpoints
const transferLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.TRANSFER_MAX_REQUESTS,
  message: {
    error: 'Too many transfer requests. Please try again later.',
  },
  standardHeaders: false,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  transferLimiter,
};
