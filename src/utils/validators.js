const joi = require('joi');

// Auth Schemas
const registerSchema = joi.object({
  full_name: joi.string().min(2).max(255).required().messages({
    'string.empty': 'Full name cannot be empty',
    'string.min': 'Full name must be at least 2 characters',
  }),
  email: joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email cannot be empty',
  }),
  password: joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.empty': 'Password cannot be empty',
  }),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

// Onboarding Schemas
const verifyBvnSchema = joi.object({
  bvn: joi.string().length(11).required().messages({
    'string.length': 'BVN must be 11 digits',
  }),
  firstName: joi.string().min(2).required(),
  lastName: joi.string().min(2).required(),
  dob: joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date of birth must be in format YYYY-MM-DD',
  }),
  phone: joi.string().min(10).required(),
});

const verifyNinSchema = joi.object({
  nin: joi.string().length(11).required().messages({
    'string.length': 'NIN must be 11 digits',
  }),
  firstName: joi.string().min(2).required(),
  lastName: joi.string().min(2).required(),
  dob: joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date of birth must be in format YYYY-MM-DD',
  }),
});

// Account Schemas
const createAccountSchema = joi.object({
  dob: joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'Date of birth must be in format YYYY-MM-DD',
  }),
});

// Transaction Schemas
const transferSchema = joi.object({
  to: joi.string().required().messages({
    'string.empty': 'Recipient account (to) cannot be empty',
  }),
  amount: joi.number().positive().required().messages({
    'number.positive': 'Amount must be greater than 0',
  }),
  narration: joi.string().max(255).optional(),
});

const validateQuery = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return { valid: false, errors: messages };
  }
  return { valid: true, value };
};

module.exports = {
  registerSchema,
  loginSchema,
  verifyBvnSchema,
  verifyNinSchema,
  createAccountSchema,
  transferSchema,
  validateQuery,
};
