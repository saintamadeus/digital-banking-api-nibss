const logger = require('../utils/logger');
const AppError = require('../utils/appError');

function errorHandler(err, req, res, next) {
  logger.error({
    message: 'Error occurred',
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle other error types
  const statusCode = err.status || 500;
  const errorResponse = {
    error: {
      message: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode,
      timestamp: new Date(),
    },
  };

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;