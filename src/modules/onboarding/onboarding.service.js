const axios = require('axios');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');
const AppError = require('../../utils/appError');
const { HTTP_STATUS, ERROR_CODES, MESSAGES } = require('../../utils/constants');
const logger = require('../../utils/logger');

class OnboardingService {
  async verifyBvn(customerId, bvn, firstName, lastName, dob, phone) {
    // Check customer isn't already verified
    const customerResult = await pool.query(
      'SELECT is_verified FROM customers WHERE id = $1',
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      throw new AppError(MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (customerResult.rows[0].is_verified) {
      throw new AppError(MESSAGES.ALREADY_VERIFIED, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    try {
      const token = await getNibssToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Insert BVN record
      await axios.post(
        `${BASE_URL}/api/insertBvn`,
        { bvn, firstName, lastName, dob, phone },
        { headers, timeout: 5000 }
      );

      // Validate BVN
      const validation = await axios.post(
        `${BASE_URL}/api/validateBvn`,
        { bvn },
        { headers, timeout: 5000 }
      );

      if (!validation.data) {
        throw new AppError(MESSAGES.VERIFICATION_FAILED, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.EXTERNAL_API_ERROR);
      }

      // Mark customer as verified
      await pool.query(
        'UPDATE customers SET is_verified = true, bvn = $1 WHERE id = $2',
        [bvn, customerId]
      );

      logger.info(`BVN verified for customer: ${customerId}`);

      return { message: MESSAGES.VERIFICATION_SUCCESS };
    } catch (err) {
      logger.error(`BVN verification failed for customer ${customerId}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.VERIFICATION_FAILED,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }

  async verifyNin(customerId, nin, firstName, lastName, dob) {
    // Check customer isn't already verified
    const customerResult = await pool.query(
      'SELECT is_verified FROM customers WHERE id = $1',
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      throw new AppError(MESSAGES.CUSTOMER_NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
    }

    if (customerResult.rows[0].is_verified) {
      throw new AppError(MESSAGES.ALREADY_VERIFIED, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
    }

    try {
      const token = await getNibssToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Insert NIN record
      await axios.post(
        `${BASE_URL}/api/insertNin`,
        { nin, firstName, lastName, dob },
        { headers, timeout: 5000 }
      );

      // Validate NIN
      const validation = await axios.post(
        `${BASE_URL}/api/validateNin`,
        { nin },
        { headers, timeout: 5000 }
      );

      if (!validation.data) {
        throw new AppError(MESSAGES.VERIFICATION_FAILED, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.EXTERNAL_API_ERROR);
      }

      // Mark customer as verified
      await pool.query(
        'UPDATE customers SET is_verified = true, nin = $1 WHERE id = $2',
        [nin, customerId]
      );

      logger.info(`NIN verified for customer: ${customerId}`);

      return { message: MESSAGES.VERIFICATION_SUCCESS };
    } catch (err) {
      logger.error(`NIN verification failed for customer ${customerId}:`, err.message);
      throw new AppError(
        err.response?.data?.message || MESSAGES.VERIFICATION_FAILED,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.EXTERNAL_API_ERROR
      );
    }
  }
}

module.exports = new OnboardingService();
