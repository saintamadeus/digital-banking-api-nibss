require('dotenv').config();
const express = require('express');
const app = express();
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const onboardingRoutes = require('./modules/onboarding/onboarding.routes');
const accountRoutes = require('./modules/accounts/accounts.routes');
const transactionRoutes = require('./modules/transactions/transactions.routes');

const { getNibssToken, clearTokenCache } = require('./config/nibss');

app.get('/test-nibss-token', async (req, res) => {
  try {
    clearTokenCache(); // Force fresh token every time
    const token = await getNibssToken();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TIT Bank API running on port ${PORT}`));

module.exports = app;