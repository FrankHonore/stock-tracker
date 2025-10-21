import express from 'express';
import {
  storeCredentials,
  getCredentials,
  deleteCredentials,
  fetchStockData,
  testAuthentication
} from '../controllers/webullController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateWebullCredentials } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Webull credentials management
router.post('/credentials', validateWebullCredentials, storeCredentials);
router.get('/credentials', getCredentials);
router.delete('/credentials', deleteCredentials);

// Webull data fetching
router.get('/stock-data', fetchStockData);
router.post('/test-auth', testAuthentication);

export default router;
