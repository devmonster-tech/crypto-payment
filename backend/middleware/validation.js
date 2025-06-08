import { body, param, validationResult } from 'express-validator';

export const validatePaymentCreation = [
  body('amount_usd')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Amount must be between 0.01 and 10000'),
  body('currency')
    .isIn(['btc', 'eth', 'usdt', 'ltc', 'bch'])
    .withMessage('Invalid currency'),
];

export const validatePaymentId = [
  param('payment_id')
    .isMongoId()
    .withMessage('Invalid payment ID format'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};
