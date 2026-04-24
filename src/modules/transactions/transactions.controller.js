const axios = require('axios');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');
const { v4: uuidv4 } = require('uuid');

async function nameEnquiry(req, res) {
  const { accountNumber } = req.params;

  try {
    const token = await getNibssToken();
    const response = await axios.get(
      `${BASE_URL}/api/account/name-enquiry/${accountNumber}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.message || 'Name enquiry failed',
    });
  }
}

async function transfer(req, res) {
  const customerId = req.customer.id;
  const { to, amount, narration } = req.body;

  if (!to || !amount) {
    return res.status(400).json({ error: 'to and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  try {
    // Get sender's account number from our DB
    const accountResult = await pool.query(
      'SELECT account_number FROM accounts WHERE customer_id = $1',
      [customerId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'You do not have a bank account' });
    }

    const from = accountResult.rows[0].account_number;

    if (from === to) {
      return res.status(400).json({ error: 'Cannot transfer to your own account' });
    }

    const reference = uuidv4();
    const token = await getNibssToken();

    // Execute transfer on NibssByPhoenix
    const response = await axios.post(`${BASE_URL}/api/transfer`, {
      from,
      to,
      amount,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Log transaction in our DB
    await pool.query(
      `INSERT INTO transactions 
        (customer_id, reference, type, amount, recipient_account, status, narration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        customerId,
        reference,
        'transfer',
        amount,
        to,
        'success',
        narration || null,
      ]
    );

    return res.status(200).json({
      message: 'Transfer successful',
      reference,
      data: response.data,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);

    // Still log failed transaction
    try {
      const accountResult = await pool.query(
        'SELECT account_number FROM accounts WHERE customer_id = $1',
        [customerId]
      );
      if (accountResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO transactions 
            (customer_id, reference, type, amount, recipient_account, status, narration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            customerId,
            uuidv4(),
            'transfer',
            req.body.amount,
            req.body.to,
            'failed',
            req.body.narration || null,
          ]
        );
      }
    } catch (logErr) {
      console.error('Failed to log transaction:', logErr.message);
    }

    return res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.message || 'Transfer failed',
    });
  }
}

async function getTransactionStatus(req, res) {
  const { ref } = req.params;
  const customerId = req.customer.id;

  try {
    // Enforce data privacy — only allow access to own transactions
    const localTx = await pool.query(
      'SELECT * FROM transactions WHERE reference = $1 AND customer_id = $2',
      [ref, customerId]
    );

    if (localTx.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const token = await getNibssToken();
    const response = await axios.get(
      `${BASE_URL}/api/transaction/${ref}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json({
      local: localTx.rows[0],
      nibss: response.data,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(err?.response?.status || 500).json({
      error: err?.response?.data?.message || 'Could not retrieve transaction status',
    });
  }
}

async function getTransactionHistory(req, res) {
  const customerId = req.customer.id;

  try {
    const result = await pool.query(
      `SELECT id, reference, type, amount, recipient_account, status, narration, created_at
       FROM transactions
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customerId]
    );

    return res.status(200).json({
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Could not retrieve transaction history' });
  }
}

module.exports = { nameEnquiry, transfer, getTransactionStatus, getTransactionHistory };