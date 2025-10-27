import express from 'express';
import { initializePublicAPI, getQuote } from '../controllers/publicController.js';

const router = express.Router();

/**
 * @route   POST /api/public/initialize
 * @desc    Initialize Public.com API and get access token
 * @access  Public
 */
router.post('/initialize', initializePublicAPI);

/**
 * @route   POST /api/public/quote
 * @desc    Get real-time quote for a stock symbol
 * @access  Public
 */
router.post('/quote', getQuote);

export default router;
