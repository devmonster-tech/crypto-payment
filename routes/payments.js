import express from 'express';
import {
  createPayment,
  getPayment,
  getCurrencies,
  paymentWebhook
} from '../controllers/paymentController.js';
import {
  validatePaymentCreation,
  validatePaymentId,
  handleValidationErrors
} from '../middleware/validation.js';

const router = express.Router();

// Create payment
router.post('/create/', 
  validatePaymentCreation,
  handleValidationErrors,
  createPayment
);

// Get payment details
router.get('/:payment_id/',
  validatePaymentId,
  handleValidationErrors,
  getPayment
);

// Get available currencies
router.get('/currencies/', getCurrencies);

// Webhook endpoint (needs raw body for signature verification)
router.post('/webhook/',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body;
    req.body = JSON.parse(req.body.toString());
    next();
  },
  paymentWebhook
);

export default router;
