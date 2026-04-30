const onboardingService = require('./onboarding.service');
const { verifyBvnSchema, verifyNinSchema, validateQuery } = require('../../utils/validators');
const { HTTP_STATUS } = require('../../utils/constants');
const AppError = require('../../utils/appError');

async function verifyBvn(req, res, next) {
  try {
    const { valid, errors, value } = validateQuery(verifyBvnSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await onboardingService.verifyBvn(
      req.customer.id,
      value.bvn,
      value.firstName,
      value.lastName,
      value.dob,
      value.phone
    );
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyNin(req, res, next) {
  try {
    const { valid, errors, value } = validateQuery(verifyNinSchema, req.body);
    if (!valid) {
      throw new AppError(errors.join(', '), HTTP_STATUS.BAD_REQUEST);
    }

    const result = await onboardingService.verifyNin(
      req.customer.id,
      value.nin,
      value.firstName,
      value.lastName,
      value.dob
    );
    res.status(HTTP_STATUS.OK).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyBvn, verifyNin };
      message: 'NIN verified successfully. You can now create an account.',
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({
      error: err?.response?.data?.message || 'NIN verification failed'
    });
  }
}

module.exports = { verifyBvn, verifyNin };