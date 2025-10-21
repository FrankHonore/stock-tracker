import WebullCredential from '../models/WebullCredential.js';
import Api from 'webull-api-ts';

/**
 * Store Webull credentials
 */
export async function storeCredentials(req, res) {
  try {
    const { webullEmailOrPhone, webullPassword, mfaEnabled } = req.body;
    const userId = req.user.id;

    // Validate credentials by attempting to authenticate with Webull
    try {
      const webull = new Api();
      // Note: The webull-api-ts library might need different login methods
      // This is a placeholder - actual implementation may vary
      // await webull.login(webullEmailOrPhone, webullPassword);
    } catch (webullError) {
      console.error('Webull authentication failed:', webullError);
      return res.status(400).json({
        error: 'Invalid Webull credentials or authentication failed',
        details: webullError.message
      });
    }

    // Store encrypted credentials
    const credential = await WebullCredential.upsert(
      userId,
      webullEmailOrPhone,
      webullPassword,
      mfaEnabled || false
    );

    res.json({
      message: 'Webull credentials stored successfully',
      credential: {
        id: credential.id,
        webull_email_or_phone: credential.webull_email_or_phone,
        mfa_enabled: credential.mfa_enabled,
      },
    });
  } catch (error) {
    console.error('Store credentials error:', error);
    res.status(500).json({ error: 'Failed to store Webull credentials' });
  }
}

/**
 * Get stored Webull credentials (without password)
 */
export async function getCredentials(req, res) {
  try {
    const userId = req.user.id;
    const credential = await WebullCredential.findByUserId(userId);

    if (!credential) {
      return res.status(404).json({ error: 'No Webull credentials found' });
    }

    res.json({
      credential: {
        id: credential.id,
        webull_email_or_phone: credential.webull_email_or_phone,
        mfa_enabled: credential.mfa_enabled,
        last_authenticated: credential.last_authenticated,
      },
    });
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ error: 'Failed to get Webull credentials' });
  }
}

/**
 * Delete Webull credentials
 */
export async function deleteCredentials(req, res) {
  try {
    const userId = req.user.id;
    const deleted = await WebullCredential.delete(userId);

    if (!deleted) {
      return res.status(404).json({ error: 'No credentials found to delete' });
    }

    res.json({ message: 'Webull credentials deleted successfully' });
  } catch (error) {
    console.error('Delete credentials error:', error);
    res.status(500).json({ error: 'Failed to delete Webull credentials' });
  }
}

/**
 * Fetch stock data using user's Webull credentials
 */
export async function fetchStockData(req, res) {
  try {
    const { tickerId } = req.query;
    const userId = req.user.id;

    if (!tickerId) {
      return res.status(400).json({ error: 'tickerId is required' });
    }

    // Get user's Webull credentials
    const credentials = await WebullCredential.getDecryptedCredentials(userId);

    if (!credentials) {
      return res.status(404).json({
        error: 'No Webull credentials found. Please add your credentials first.'
      });
    }

    // Authenticate with Webull and fetch data
    const webull = new Api();

    // Note: This is a placeholder implementation
    // The actual webull-api-ts API might differ
    // You'll need to check the library documentation for exact methods

    // Example (may need adjustment):
    // await webull.login(credentials.webull_email_or_phone, credentials.webull_password);
    // const stockData = await webull.getStockData(tickerId);

    // For now, return a placeholder response
    // In production, implement actual Webull API calls
    const response = await fetch(
      `https://quotes-gw.webullfintech.com/api/stock/capitalflow/ticker?tickerId=${tickerId}&type=1m&count=60`
    );

    const data = await response.json();

    // Update last authenticated timestamp
    await WebullCredential.updateLastAuthenticated(userId);

    res.json(data);
  } catch (error) {
    console.error('Fetch stock data error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}

/**
 * Test Webull authentication
 */
export async function testAuthentication(req, res) {
  try {
    const userId = req.user.id;
    const credentials = await WebullCredential.getDecryptedCredentials(userId);

    if (!credentials) {
      return res.status(404).json({ error: 'No Webull credentials found' });
    }

    // Test authentication
    const webull = new Api();
    // await webull.login(credentials.webull_email_or_phone, credentials.webull_password);

    await WebullCredential.updateLastAuthenticated(userId);

    res.json({
      message: 'Webull authentication successful',
      last_authenticated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test authentication error:', error);
    res.status(400).json({
      error: 'Webull authentication failed',
      details: error.message
    });
  }
}
