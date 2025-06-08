import Payment from '../models/Payment.js';
import * as paymentService from '../services/paymentService.js';
import * as qrCodeService from '../services/qrCodeService.js';

export const createPayment = async (req, res) => {
  try {
    const { amount_usd, currency } = req.body;

    // Create payment in database
    const payment = new Payment({
      amount_usd,
      currency
    });
    await payment.save();

    // Create payment with NowPayments
    const paymentData = await paymentService.createPayment(payment);
    
    if (paymentData) {
      // Generate QR codes
      if (payment.pay_address) {
        payment.address_qr_code = await qrCodeService.generatePaymentQR(
          payment.pay_address,
          payment.payment_amount,
          payment.currency
        );
      }
      
      if (payment.payment_url) {
        payment.payment_url_qr_code = await qrCodeService.generateQRCode(payment.payment_url);
      }
      
      await payment.save();
      
      res.status(201).json({
        id: payment.id,
        amount_usd: payment.amount_usd,
        currency: payment.currency,
        status: payment.status,
        payment_amount: payment.payment_amount,
        pay_address: payment.pay_address,
        payment_url: payment.payment_url,
        address_qr_code: payment.address_qr_code,
        payment_url_qr_code: payment.payment_url_qr_code,
        created_at: payment.createdAt,
        updated_at: payment.updatedAt
      });
    } else {
      await payment.deleteOne();
      res.status(400).json({
        error: 'Failed to create payment with provider'
      });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const getPayment = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const payment = await Payment.findById(payment_id);
    
    if (!payment) {
      return res.status(404).json({
        error: 'Payment not found'
      });
    }
    
    // Generate QR codes if not already generated
    let updated = false;
    
    if (payment.pay_address && !payment.address_qr_code) {
      payment.address_qr_code = await qrCodeService.generatePaymentQR(
        payment.pay_address,
        payment.payment_amount,
        payment.currency
      );
      updated = true;
    }
    
    if (payment.payment_url && !payment.payment_url_qr_code) {
      payment.payment_url_qr_code = await qrCodeService.generateQRCode(payment.payment_url);
      updated = true;
    }
    
    if (updated) {
      await payment.save();
    }
    
    res.json({
      id: payment.id,
      amount_usd: payment.amount_usd,
      currency: payment.currency,
      status: payment.status,
      payment_amount: payment.payment_amount,
      pay_address: payment.pay_address,
      payment_url: payment.payment_url,
      address_qr_code: payment.address_qr_code,
      payment_url_qr_code: payment.payment_url_qr_code,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const currencies = await paymentService.getAvailableCurrencies();
    
    if (currencies) {
      // Filter to show only supported currencies
      const supportedCurrencies = [
        { code: 'btc', name: 'Bitcoin' },
        { code: 'eth', name: 'Ethereum' },
        { code: 'usdt', name: 'Tether' },
        { code: 'ltc', name: 'Litecoin' },
        { code: 'bch', name: 'Bitcoin Cash' },
      ];
      res.json(supportedCurrencies);
    } else {
      res.status(500).json({
        error: 'Failed to fetch currencies'
      });
    }
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

export const paymentWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-nowpayments-sig'];
    
    if (!paymentService.verifyWebhook(req.rawBody, signature)) {
      return res.status(400).send('Invalid signature');
    }
    
    // Process webhook data
    const { order_id, payment_status } = req.body;
    
    // Update payment status
    const payment = await Payment.findById(order_id);
    if (!payment) {
      console.log(`Payment ${order_id} not found`);
      return res.status(404).send('Payment not found');
    }
    
    payment.status = payment_status;
    await payment.save();
    
    console.log(`Payment ${order_id} status updated to ${payment_status}`);
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
};
