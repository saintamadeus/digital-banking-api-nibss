const transactionsService = require('./transactions.service');
const { transferSchema, validateQuery } = require('../../utils/validators');
const { HTTP_STATUS, PAGINATION } = require('../../utils/constants');
const AppError = require('../../utils/appError');

async function nameEnquiry(req, res, next) {
  try {
    const { accountNumber } = req.params;
    const result = await transactionsService.nameEnquiry(accountNumber);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  try {
    const { valid, errors, value } = validateQuery(transferSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await transactionsService.transfer(
      req.customer.id,
      value.to,
      value.amount,
      value.narration
    );
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

async function getTransactionStatus(req, res, next) {
  try {
    const { ref } = req.params;
    const result = await transactionsService.getTransactionStatus(req.customer.id, ref);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

async function getTransactionHistory(req, res, next) {
  try {
    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT;

    const result = await transactionsService.getTransactionHistory(req.customer.id, page, limit);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { nameEnquiry, transfer, getTransactionStatus, getTransactionHistory };