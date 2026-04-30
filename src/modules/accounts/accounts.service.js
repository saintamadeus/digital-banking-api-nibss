const axios = require('axios');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');
const AppError = require('../../utils/appError');
const { HTTP_STATUS, ERROR_CODES, MESSAGES } = require('../../utils/constants');
const logger = require('../../utils/logger');

class AccountsService {
  async createAccount(customerId, dob) {
    // Get customer details
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      throw new AppError(MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const customer = customerResult.rows[0];

    if (!customer.is_verified) {
      throw new AppError(MESSAGES.NOT_VERIFIED, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
    }

    // Check if customer already has an account
    const accountResult = await pool.query(
      'SELECT id FROM accounts WHERE customer_id = $1',
      [customerId]
    );

    if (accountResult.rows.length > 0) {
      throw new AppError(MESSAGES.ACCOUNT_EXISTS, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    try {
      const kycType = customer.bvn ? 'bvn' : 'nin';
      const kycID = customer.bvn || customer.nin;
      const token = await getNibssToken();

      const response = await axios.post(
        `${BASE_URL}/api/account/create`,
        { kycType, kycID, dob },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      const accountNumber = response.data.account?.accountNumber;

      if (!accountNumber) {
        throw new AppError(MESSAGES.ACCOUNT_CREATION_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.EXTERNAL_API_ERROR);
      }

      // Save account to DB
      await pool.query(
        'INSERT INTO accounts (customer_id, account_number) VALUES ($1, $2)',
        [customerId, accountNumber]
      );

      logger.info(`Account created for customer: ${customerId}`);

      return {
        message: MESSAGES.ACCOUNT_CREATED,
        account: {
          account_number: accountNumber,
          customer_name: customer.full_name,
        },
      };
    } catch (err) {
      logger.error(`Account creation failed for customer ${customerId}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.ACCOUNT_CREATION_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }

  async getBalance(customerId) {
    const accountResult = await pool.query(
      'SELECT account_number FROM accounts WHERE customer_id = $1',
      [customerId]
    );

    if (accountResult.rows.length === 0) {
      throw new AppError(MESSAGES.ACCOUNT_NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const accountNumber = accountResult.rows[0].account_number;

    try {
      const token = await getNibssToken();

      const response = await axios.get(
        `${BASE_URL}/api/account/balance/${accountNumber}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      logger.info(`Balance retrieved for customer: ${customerId}`);

      return {
        account_number: accountNumber,
        balance: response.data,
      };
    } catch (err) {
      logger.error(`Balance retrieval failed for customer ${customerId}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.BALANCE_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }
}

module.exports = new AccountsService();
