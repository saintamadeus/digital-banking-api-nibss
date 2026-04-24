const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

async function register(req, res) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'full_name, email and password are required' });
  }

  try {
    const exists = await pool.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO customers (full_name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, full_name, email, is_verified`,
      [full_name, email, password_hash]
    );

    return res.status(201).json({
      message: 'Registration successful. Proceed to verify your identity.',
      customer: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const customer = result.rows[0];
    const valid = await bcrypt.compare(password, customer.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        is_verified: customer.is_verified,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };