import axios from 'axios';

// Store access token and account ID in memory (could use Redis in production)
let accessToken = null;
let tokenExpiry = null;
let cachedAccountId = null;

/**
 * Initialize Public.com API and get access token
 */
export const initializePublicAPI = async (req, res) => {
  try {
    const apiSecret = process.env.PUBLIC_API_SECRET;

    if (!apiSecret) {
      return res.status(500).json({
        error: 'PUBLIC_API_SECRET not configured on server',
      });
    }

    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry && cachedAccountId) {
      return res.json({
        success: true,
        accessToken,
        accountId: cachedAccountId,
        message: 'Already initialized',
      });
    }

    // Exchange secret for access token
    const tokenResponse = await axios.post(
      'https://api.public.com/userapiauthservice/personal/access-tokens',
      {
        validityInMinutes: 60,
        secret: apiSecret,
      }
    );

    accessToken = tokenResponse.data.accessToken;
    tokenExpiry = Date.now() + (55 * 60 * 1000); // 55 minutes (5 min buffer)

    // Get account ID
    const accountResponse = await axios.get(
      'https://api.public.com/userapigateway/trading/account',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Account response:', JSON.stringify(accountResponse.data, null, 2));
    cachedAccountId = accountResponse.data.accounts[0].accountId;
    console.log('Cached account ID:', cachedAccountId);

    res.json({
      success: true,
      accessToken,
      accountId: cachedAccountId,
    });
  } catch (error) {
    console.error('Public API initialization error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Failed to initialize Public.com API',
    });
  }
};

/**
 * Get quote for a stock symbol
 */
export const getQuote = async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Ensure we have a valid token
    if (!accessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
      return res.status(401).json({ error: 'API not initialized. Call /initialize first' });
    }

    // Get account ID from request or fetch it
    let accountId = req.body.accountId;

    if (!accountId) {
      const accountResponse = await axios.get(
        'https://api.public.com/userapigateway/trading/account',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      accountId = accountResponse.data.accountId;
    }

    // Get quote
    const quoteResponse = await axios.post(
      `https://api.public.com/userapigateway/marketdata/${accountId}/quotes`,
      {
        instruments: [
          {
            symbol: symbol.toUpperCase(),
            type: 'EQUITY',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(quoteResponse.data);
  } catch (error) {
    console.error('Get quote error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Failed to fetch quote',
    });
  }
};
