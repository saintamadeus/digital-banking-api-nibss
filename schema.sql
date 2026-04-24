-- TIT Bank Digital Banking API
-- Run this file to set up the PostgreSQL database schema

CREATE DATABASE digital_banking;

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
  type VARCHAR(50) NOT NULL, -- 'intra' or 'inter'
  amount NUMERIC(15,2) NOT NULL,
  recipient_account VARCHAR(20) NOT NULL,
  recipient_bank_code VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending',
  narration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);