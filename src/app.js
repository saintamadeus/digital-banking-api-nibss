require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const app = express();
const errorHandler = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/logging');
const { generalLimiter } = require('./middleware/rateLimiter');
const { validateEnvironment } = require('./utils/validateEnv');
const logger = require('./utils/logger');

// Validate environment variables
validateEnvironment();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json());

// Logging
app.use(loggingMiddleware);

// Rate limiting
app.use(generalLimiter);

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const onboardingRoutes = require('./modules/onboarding/onboarding.routes');
const accountRoutes = require('./modules/accounts/accounts.routes');
const transactionRoutes = require('./modules/transactions/transactions.routes');

const { getNibssToken, clearTokenCache } = require('./config/nibss');

app.get('/test-nibss-token', async (req, res, next) => {
  try {
    clearTokenCache(); // Force fresh token every time
    const token = await getNibssToken();
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    }
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`TIT Bank API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;