const accountsService = require('./accounts.service');
const { createAccountSchema, validateQuery } = require('../../utils/validators');
const { HTTP_STATUS } = require('../../utils/constants');
const AppError = require('../../utils/appError');

async function createAccount(req, res, next) {
  try {
    const { valid, errors, value } = validateQuery(createAccountSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await accountsService.createAccount(req.customer.id, value.dob);
    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (err) {
    next(err);
  }
}

async function getBalance(req, res, next) {
  try {
    const result = await accountsService.getBalance(req.customer.id);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createAccount, getBalance };

module.exports = { createAccount, getBalance };