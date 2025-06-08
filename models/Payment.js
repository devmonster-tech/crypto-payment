import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount_usd: {
    type: Number,
    required: true,
    min: 0.01,
    max: 10000,
  },
  currency: {
    type: String,
    required: true,
    enum: ['btc', 'eth', 'usdt', 'ltc', 'bch'],
  },
  status: {
    type: String,
    enum: [
      'waiting',
      'confirming', 
      'confirmed',
      'sending',
      'partially_paid',
      'finished',
      'failed',
      'refunded',
      'expired'
    ],
    default: 'waiting',
  },
  nowpayments_id: {
    type: String,
    default: null,
  },
  payment_amount: {
    type: Number,
    default: null,
  },
  pay_address: {
    type: String,
    default: null,
  },
  payment_url: {
    type: String,
    default: null,
  },
  address_qr_code: {
    type: String,
    default: null,
  },
  payment_url_qr_code: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

export default mongoose.model('Payment', paymentSchema);
