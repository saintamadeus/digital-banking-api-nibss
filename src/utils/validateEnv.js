const logger = require('./logger');

const REQUIRED_ENV_VARS = [
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'NIBSS_BASE_URL',
  'NIBSS_API_KEY',
  'NIBSS_API_SECRET',
  'NIBSS_BANK_CODE',
  'NIBSS_BANK_NAME',
];

const validateEnvironment = () => {
  const missing = [];

  REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  logger.info('All required environment variables are present');
};

module.exports = { validateEnvironment };
