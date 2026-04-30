const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const AppError = require('../../utils/appError');
const { HTTP_STATUS, ERROR_CODES, MESSAGES, JWT } = require('../../utils/constants');
const logger = require('../../utils/logger');

class AuthService {
  async register(fullName, email, password) {
    // Check if email already exists
    const existsResult = await pool.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );

    if (existsResult.rows.length > 0) {
      throw new AppError(MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create customer
    const result = await pool.query(
      `INSERT INTO customers (full_name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, full_name, email, is_verified`,
      [fullName, email, passwordHash]
    );

    logger.info(`Customer registered: ${result.rows[0].id}`);

    return {
      message: MESSAGES.REGISTRATION_SUCCESS,
      customer: result.rows[0],
    };
  }

  async login(email, password) {
    const result = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const customer = result.rows[0];
    const passwordValid = await bcrypt.compare(password, customer.password_hash);

    if (!passwordValid) {
      logger.warn(`Failed login for customer: ${customer.id}`);
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: JWT.EXPIRES_IN }
    );

    logger.info(`Customer logged in: ${customer.id}`);

    return {
      message: MESSAGES.LOGIN_SUCCESS,
      token,
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        is_verified: customer.is_verified,
      },
    };
  }
}

module.exports = new AuthService();
