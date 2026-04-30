const axios = require('axios');
const pool = require('../../config/db');
const { getNibssToken, BASE_URL } = require('../../config/nibss');

async function verifyBvn(req, res) {
  const { bvn, firstName, lastName, dob, phone } = req.body;
  const customerId = req.customer.id;

  if (!bvn || !firstName || !lastName || !dob || !phone) {
    return res.status(400).json({ error: 'bvn, firstName, lastName, dob and phone are required' });
  }

  try {
    // Check customer isn't already verified
    const customer = await pool.query(
      'SELECT is_verified FROM customers WHERE id = $1',
      [customerId]
    );
    if (customer.rows[0].is_verified) {
      return res.status(400).json({ error: 'Customer is already verified' });
    }

    const token = await getNibssToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Insert BVN record
    await axios.post(`${BASE_URL}/api/insertBvn`, {
      bvn, firstName, lastName, dob, phone
    }, { headers });

    // Validate BVN
    const validation = await axios.post(`${BASE_URL}/api/validateBvn`, 
      { bvn }, 
      { headers }
    );

    if (!validation.data) {
      return res.status(400).json({ error: 'BVN validation failed' });
    }

    // Mark customer as verified in our DB
    await pool.query(
      'UPDATE customers SET is_verified = true, bvn = $1 WHERE id = $2',
      [bvn, customerId]
    );

    return res.status(200).json({
      message: 'BVN verified successfully. You can now create an account.',
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(500).json({ 
      error: err?.response?.data?.message || 'BVN verification failed' 
    });
  }
}

async function verifyNin(req, res) {
  const { nin, firstName, lastName, dob } = req.body;
  const customerId = req.customer.id;

  if (!nin || !firstName || !lastName || !dob) {
    return res.status(400).json({ error: 'nin, firstName, lastName and dob are required' });
  }

  try {
    // Check customer isn't already verified
    const customer = await pool.query(
      'SELECT is_verified FROM customers WHERE id = $1',
      [customerId]
    );
    if (customer.rows[0].is_verified) {
      return res.status(400).json({ error: 'Customer is already verified' });
    }

    const token = await getNibssToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Insert NIN record
    await axios.post(`${BASE_URL}/api/insertNin`, {
      nin, firstName, lastName, dob
    }, { headers });

    // Validate NIN
    const validation = await axios.post(`${BASE_URL}/api/validateNin`,
      { nin },
      { headers }
    );

    if (!validation.data) {
      return res.status(400).json({ error: 'NIN validation failed' });
    }

    // Mark customer as verified
    await pool.query(
      'UPDATE customers SET is_verified = true, nin = $1 WHERE id = $2',
      [nin, customerId]
    );

    return res.status(200).json({
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