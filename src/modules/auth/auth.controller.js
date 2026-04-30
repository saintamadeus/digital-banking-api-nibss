const authService = require('./auth.service');
const { registerSchema, loginSchema, validateQuery } = require('../../utils/validators');
const { HTTP_STATUS, MESSAGES } = require('../../utils/constants');
const AppError = require('../../utils/appError');

async function register(req, res, next) {
  try {
    // Validate request
    const { valid, errors, value } = validateQuery(registerSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await authService.register(value.full_name, value.email, value.password);
    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    // Validate request
    const { valid, errors, value } = validateQuery(loginSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await authService.login(value.email, value.password);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };