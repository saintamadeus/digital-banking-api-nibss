TIT Bank — Digital Banking API
A backend REST API for a digital banking system built with Node.js, Express, and PostgreSQL. Integrates with the NibssByPhoenix core banking infrastructure for BVN/NIN identity verification, account management, and fund transfers.

Tech Stack

Runtime: Node.js
Framework: Express.js
Database: PostgreSQL
Authentication: JWT (JSON Web Tokens)
Password Hashing: bcrypt
External API: NibssByPhoenix Banking Infrastructure
HTTP Client: Axios


Features

Customer registration and JWT-based authentication
Identity verification via BVN or NIN (integrated with NibssByPhoenix)
Bank account creation (one account per verified customer)
Account balance check
Name enquiry before transfers
Intra-bank and inter-bank fund transfers
Transaction history with strict per-customer data isolation
Transaction status check by reference


Project Structure
digital-banking-api/
├── src/
│   ├── config/
│   │   ├── db.js           # PostgreSQL connection pool
│   │   └── nibss.js        # NibssByPhoenix token management
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   └── errorHandler.js # Global error handler
│   ├── modules/
│   │   ├── auth/           # Register and login
│   │   ├── onboarding/     # BVN and NIN verification
│   │   ├── accounts/       # Account creation and balance
│   │   └── transactions/   # Transfers, history, status
│   └── app.js
├── .env
├── .gitignore
└── package.json

Getting Started
Prerequisites

Node.js v18+
PostgreSQL
A NibssByPhoenix API key and secret (obtain by calling POST /api/fintech/onboard)

Installation
bashgit clone https://github.com/saintamadeus/digital-banking-api-nibss.git
cd digital-banking-api-nibss
npm install
Environment Variables
Create a .env file in the project root:
envPORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/digital_banking

JWT_SECRET=your_jwt_secret

NIBSS_BASE_URL=https://nibssbyphoenix.onrender.com
NIBSS_API_KEY=your_nibss_api_key
NIBSS_API_SECRET=your_nibss_api_secret
NIBSS_BANK_CODE=your_bank_code
NIBSS_BANK_NAME=your_bank_name
Database Setup
Run the following SQL against your PostgreSQL instance:
sqlCREATE DATABASE digital_banking;

\c digital_banking

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bvn VARCHAR(11),
  nin VARCHAR(11),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER UNIQUE REFERENCES customers(id),
  account_number VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  recipient_account VARCHAR(20) NOT NULL,
  recipient_bank_code VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending',
  narration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
Run the Server
bash# Development
npm run dev

# Production
npm start

API Reference
Auth
MethodEndpointDescriptionAuth RequiredPOST/api/auth/registerRegister a new customerNoPOST/api/auth/loginLogin and receive JWTNo
Onboarding
MethodEndpointDescriptionAuth RequiredPOST/api/onboarding/bvnVerify identity via BVNYesPOST/api/onboarding/ninVerify identity via NINYes
Accounts
MethodEndpointDescriptionAuth RequiredPOST/api/accounts/createCreate bank account (verified customers only)YesGET/api/accounts/balanceGet account balanceYes
Transactions
MethodEndpointDescriptionAuth RequiredGET/api/transactions/name-enquiry/:accountNumberVerify recipient before transferYesPOST/api/transactions/transferTransfer fundsYesGET/api/transactions/historyView own transaction historyYesGET/api/transactions/status/:refCheck transaction status by referenceYes

Security

Passwords are hashed with bcrypt before storage
All protected routes require a valid JWT in the Authorization: Bearer header
Customers can only access their own transactions — customer ID is enforced at the query level on every data retrieval
Credentials are stored in environment variables and never committed to version control


External API Integration
This project integrates with NibssByPhoenix for core banking operations. NibssByPhoenix handles account balances and executes fund transfers. This API acts as a middleware layer that manages customer identity, enforces data privacy, and records transactions locally.
Authentication with NibssByPhoenix is handled automatically — tokens are fetched and cached server-side on demand.