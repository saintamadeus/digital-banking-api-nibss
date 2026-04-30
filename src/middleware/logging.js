const logger = require('../utils/logger');

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info({
    message: 'Incoming request',
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Override res.json to log responses
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    logger.info({
      message: 'Outgoing response',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
    return originalJson(data);
  };

  next();
};

module.exports = loggingMiddleware;
