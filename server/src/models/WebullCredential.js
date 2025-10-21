import pool from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';

class WebullCredential {
  /**
   * Store or update Webull credentials for a user
   * @param {number} userId - User ID
   * @param {string} webullEmailOrPhone - Webull email or phone
   * @param {string} webullPassword - Webull password (will be encrypted)
   * @param {boolean} mfaEnabled - Whether MFA is enabled
   * @returns {Object} - Credential object (without password)
   */
  static async upsert(userId, webullEmailOrPhone, webullPassword, mfaEnabled = false) {
    const encryptedPassword = encrypt(webullPassword);

    const query = `
      INSERT INTO webull_credentials (user_id, webull_email_or_phone, webull_password_encrypted, mfa_enabled)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET
        webull_email_or_phone = EXCLUDED.webull_email_or_phone,
        webull_password_encrypted = EXCLUDED.webull_password_encrypted,
        mfa_enabled = EXCLUDED.mfa_enabled
      RETURNING id, user_id, webull_email_or_phone, mfa_enabled, created_at, updated_at
    `;

    const result = await pool.query(query, [userId, webullEmailOrPhone, encryptedPassword, mfaEnabled]);
    return result.rows[0];
  }

  /**
   * Get Webull credentials for a user
   * @param {number} userId - User ID
   * @returns {Object|null} - Credential object or null
   */
  static async findByUserId(userId) {
    const query = 'SELECT * FROM webull_credentials WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get decrypted Webull credentials for a user
   * @param {number} userId - User ID
   * @returns {Object|null} - Credential object with decrypted password or null
   */
  static async getDecryptedCredentials(userId) {
    const credential = await this.findByUserId(userId);
    if (!credential) return null;

    return {
      ...credential,
      webull_password: decrypt(credential.webull_password_encrypted),
    };
  }

  /**
   * Update last authenticated timestamp
   * @param {number} userId - User ID
   * @returns {Object} - Updated credential object
   */
  static async updateLastAuthenticated(userId) {
    const query = `
      UPDATE webull_credentials
      SET last_authenticated = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING id, user_id, webull_email_or_phone, mfa_enabled, last_authenticated
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Delete Webull credentials for a user
   * @param {number} userId - User ID
   * @returns {boolean} - True if deleted successfully
   */
  static async delete(userId) {
    const query = 'DELETE FROM webull_credentials WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Check if user has Webull credentials stored
   * @param {number} userId - User ID
   * @returns {boolean} - True if credentials exist
   */
  static async hasCredentials(userId) {
    const query = 'SELECT COUNT(*) FROM webull_credentials WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count) > 0;
  }
}

export default WebullCredential;
