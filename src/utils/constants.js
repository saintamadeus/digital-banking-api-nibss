// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// Messages
const MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  REGISTRATION_SUCCESS: 'Registration successful. Proceed to verify your identity.',
  LOGIN_SUCCESS: 'Login successful',
  NO_TOKEN: 'No token provided',
  INVALID_TOKEN: 'Invalid or expired token',
  
  CUSTOMER_NOT_FOUND: 'Customer not found',
  ALREADY_VERIFIED: 'Customer is already verified',
  NOT_VERIFIED: 'Complete BVN or NIN verification before creating an account',
  VERIFICATION_SUCCESS: 'Identity verified successfully. You can now create an account.',
  VERIFICATION_FAILED: 'Identity verification failed',
  
  ACCOUNT_EXISTS: 'Customer already has an account',
  ACCOUNT_NOT_FOUND: 'No account found for this customer',
  ACCOUNT_CREATED: 'Account created successfully',
  ACCOUNT_CREATION_FAILED: 'Account creation failed',
  
  NO_ACCOUNT: 'You do not have a bank account',
  SELF_TRANSFER: 'Cannot transfer to your own account',
  AMOUNT_INVALID: 'Amount must be greater than 0',
  TO_REQUIRED: 'Recipient account (to) is required',
  AMOUNT_REQUIRED: 'Amount is required',
  TRANSFER_SUCCESS: 'Transfer successful',
  TRANSFER_FAILED: 'Transfer failed',
  NAME_ENQUIRY_FAILED: 'Name enquiry failed',
  TRANSACTION_NOT_FOUND: 'Transaction not found',
  TRANSACTION_STATUS_FAILED: 'Could not retrieve transaction status',
  TRANSACTION_HISTORY_FAILED: 'Could not retrieve transaction history',
  BALANCE_FAILED: 'Could not retrieve balance',
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// JWT
const JWT = {
  EXPIRES_IN: '24h',
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  AUTH_MAX_REQUESTS: 5,
  TRANSFER_MAX_REQUESTS: 10,
};

// Transaction Types
const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
};

// Transaction Status
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
};

module.exports = {
  HTTP_STATUS,
  ERROR_CODES,
  MESSAGES,
  PAGINATION,
  JWT,
  RATE_LIMIT,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
};
