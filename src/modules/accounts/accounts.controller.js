const axios = require('axios');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');

async function createAccount(req, res) {
  const customerId = req.customer.id;
  const { dob } = req.body;

  try {
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE id = $1',
      [customerId]
    );
    const customer = customerResult.rows[0];

    if (!customer.is_verified) {
      return res.status(403).json({ error: 'Complete BVN or NIN verification before creating an account' });
    }

    const existingAccount = await pool.query(
      'SELECT id FROM accounts WHERE customer_id = $1',
      [customerId]
    );
    if (existingAccount.rows.length > 0) {
      return res.status(409).json({ error: 'Customer already has an account' });
    }

    if (!dob) {
      return res.status(400).json({ error: 'dob is required' });
    }

    const kycType = customer.bvn ? 'bvn' : 'nin';
    const kycID = customer.bvn || customer.nin;
    const token = await getNibssToken();

    const response = await axios.post(`${BASE_URL}/api/account/create`, {
      kycType,
      kycID,
      dob,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

const accountNumber = response.data.account.accountNumber;
    if (!accountNumber) {
      return res.status(500).json({ error: 'Account creation failed — no account number returned' });
    }

    await pool.query(
      'INSERT INTO accounts (customer_id, account_number) VALUES ($1, $2)',
      [customerId, accountNumber]
    );

    return res.status(201).json({
      message: 'Account created successfully',
      account: {
        account_number: accountNumber,
        customer_name: customer.full_name,
      },
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({
      error: err?.response?.data?.message || 'Account creation failed',
    });
  }
}

async function getBalance(req, res) {
  const customerId = req.customer.id;

  try {
    const accountResult = await pool.query(
      'SELECT account_number FROM accounts WHERE customer_id = $1',
      [customerId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'No account found for this customer' });
    }

    const accountNumber = accountResult.rows[0].account_number;
    const token = await getNibssToken();

    const response = await axios.get(
      `${BASE_URL}/api/account/balance/${accountNumber}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json({
      account_number: accountNumber,
      balance: response.data,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({
      error: err?.response?.data?.message || 'Could not retrieve balance',
    });
  }
}

module.exports = { createAccount, getBalance };