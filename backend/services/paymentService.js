import axios from 'axios';
import crypto from 'crypto';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_BASE_URL = process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io/v1';
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const SITE_URL = process.env.SITE_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

const headers = {
  'x-api-key': NOWPAYMENTS_API_KEY,
  'Content-Type': 'application/json'
};

export const getAvailableCurrencies = async () => {
  try {
    const response = await axios.get(`${NOWPAYMENTS_BASE_URL}/currencies`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching currencies:', error.message);
    return null;
  }
};

export const createPayment = async (paymentObj) => {
  const payload = {
    price_amount: parseFloat(paymentObj.amount_usd),
    price_currency: "usd",
    pay_currency: paymentObj.currency,
    order_id: paymentObj.id.toString(),
    order_description: `Payment for $${paymentObj.amount_usd}`,
    ipn_callback_url: `${SITE_URL}/api/payments/webhook/`,
    success_url: `${FRONTEND_URL}/payment/success/`,
    cancel_url: `${FRONTEND_URL}/payment/cancel/`
  };
  
  try {
    const response = await axios.post(
      `${NOWPAYMENTS_BASE_URL}/payment`,
      payload,
      { headers }
    );
    
    const data = response.data;
    
    // Update payment object with NowPayments data
    paymentObj.nowpayments_id = data.payment_id;
    paymentObj.payment_amount = data.pay_amount;
    paymentObj.pay_address = data.pay_address;
    paymentObj.payment_url = data.invoice_url;
    await paymentObj.save();
    
    return data;
  } catch (error) {
    console.error('Error creating payment:', error.message);
    return null;
  }
};

export const verifyWebhook = (requestData, signature) => {
  const expectedSignature = crypto
    .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
    .update(requestData)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};
