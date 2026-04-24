const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.NIBSS_BASE_URL;

let cachedToken = null;
let tokenExpiry = null;

async function getNibssToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: process.env.NIBSS_API_KEY,
    apiSecret: process.env.NIBSS_API_SECRET,
  });

  // Log the full response so we can see token lifetime
  console.log('NIBSS token response:', response.data);

  cachedToken = response.data.token;
  // Cache for 45 minutes to be safe
  tokenExpiry = Date.now() + 45 * 60 * 1000;

  return cachedToken;
}

function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

module.exports = { getNibssToken, BASE_URL, clearTokenCache };