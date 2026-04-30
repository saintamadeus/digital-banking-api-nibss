const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');
const AppError = require('../../utils/appError');
const { HTTP_STATUS, ERROR_CODES, MESSAGES, TRANSACTION_TYPES, TRANSACTION_STATUS, PAGINATION } = require('../../utils/constants');
const logger = require('../../utils/logger');

class TransactionsService {
  async nameEnquiry(accountNumber) {
    try {
      const token = await getNibssToken();
      const response = await axios.get(
        `${BASE_URL}/api/account/name-enquiry/${accountNumber}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      logger.info(`Name enquiry for account: ${accountNumber}`);
      return response.data;
    } catch (err) {
      logger.error(`Name enquiry failed for account ${accountNumber}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.NAME_ENQUIRY_FAILED,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }

  async transfer(customerId, to, amount, narration) {
    // Get sender's account
    const accountResult = await pool.query(
      'SELECT account_number FROM accounts WHERE customer_id = $1',
      [customerId]
    );

    if (accountResult.rows.length === 0) {
      throw new AppError(MESSAGES.NO_ACCOUNT, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const from = accountResult.rows[0].account_number;

    if (from === to) {
      throw new AppError(MESSAGES.SELF_TRANSFER, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    const reference = uuidv4();

    try {
      const token = await getNibssToken();

      const response = await axios.post(
        `${BASE_URL}/api/transfer`,
        { from, to, amount },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      const nibssReference = response.data.reference;

      // Log successful transaction
      await pool.query(
        `INSERT INTO transactions 
          (customer_id, reference, nibss_reference, type, amount, recipient_account, status, narration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [customerId, reference, nibssReference, TRANSACTION_TYPES.TRANSFER, amount, to, TRANSACTION_STATUS.SUCCESS, narration || null]
      );

      logger.info(`Transfer successful for customer ${customerId}: ${amount} to ${to}`);

      return {
        message: MESSAGES.TRANSFER_SUCCESS,
        reference,
        data: response.data,
      };
    } catch (err) {
      logger.error(`Transfer failed for customer ${customerId}:`, err.message);

      // Log failed transaction
      try {
        await pool.query(
          `INSERT INTO transactions 
            (customer_id, reference, type, amount, recipient_account, status, narration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [customerId, uuidv4(), TRANSACTION_TYPES.TRANSFER, amount, to, TRANSACTION_STATUS.FAILED, narration || null]
        );
      } catch (logErr) {
        logger.error('Failed to log transaction:', logErr.message);
      }

      throw new AppError(
        err.response?.data?.message || MESSAGES.TRANSFER_FAILED,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }

  async getTransactionStatus(customerId, reference) {
    const localTx = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1 AND customer_id = $2',
      [reference, customerId]
    );

    if (localTx.rows.length === 0) {
      throw new AppError(MESSAGES.TRANSACTION_NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    const nibssRef = localTx.rows[0].nibss_reference;

    try {
      const token = await getNibssToken();

      const response = await axios.get(
        `${BASE_URL}/api/transaction/${nibssRef}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      logger.info(`Transaction status retrieved for customer ${customerId}`);

      return {
        local: localTx.rows[0],
        nibss: response.data,
      };
    } catch (err) {
      logger.error(`Transaction status failed for customer ${customerId}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.TRANSACTION_STATUS_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }

  async getTransactionHistory(customerId, page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
    // Validate pagination
    if (page < 1) page = PAGINATION.DEFAULT_PAGE;
    if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
    if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

    const offset = (page - 1) * limit;

    try {
      // Get total count
      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM transactions WHERE customer_id = $1',
        [customerId]
      );

      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      const result = await pool.query(
        `SELECT id, reference, type, amount, recipient_account, status, narration, created_at
         FROM transactions
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
      );

      const totalPages = Math.ceil(total / limit);

      logger.info(`Transaction history retrieved for customer ${customerId}, page ${page}`);

      return {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        transactions: result.rows,
      };
    } catch (err) {
      logger.error(`Transaction history failed for customer ${customerId}:`, err.message);
      throw new AppError(
        MESSAGES.TRANSACTION_HISTORY_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.DATABASE_ERROR
      );
    }
  }
}

module.exports = new TransactionsService();
