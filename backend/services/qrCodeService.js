import QRCode from 'qrcode';

export const generateQRCode = async (data, options = {}) => {
  try {
    const defaultOptions = {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256,
      ...options
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error.message);
    return null;
  }
};

export const generatePaymentQR = async (paymentAddress, amount = null, currency = null) => {
  let qrData;
  
  if (currency) {
    const currencyLower = currency.toLowerCase();
    
    if (currencyLower === 'bitcoin' || currencyLower === 'btc') {
      // Bitcoin URI format
      qrData = `bitcoin:${paymentAddress}`;
      if (amount) {
        qrData += `?amount=${amount}`;
      }
    } else if (currencyLower === 'ethereum' || currencyLower === 'eth') {
      // Ethereum URI format
      qrData = `ethereum:${paymentAddress}`;
      if (amount) {
        qrData += `?value=${amount}`;
      }
    } else {
      // Generic address for other cryptocurrencies
      qrData = paymentAddress;
    }
  } else {
    qrData = paymentAddress;
  }
  
  return await generateQRCode(qrData);
};

export const generateBitcoinQR = async (address, amount = null, label = null, message = null) => {
  let uri = `bitcoin:${address}`;
  const params = [];
  
  if (amount) params.push(`amount=${amount}`);
  if (label) params.push(`label=${encodeURIComponent(label)}`);
  if (message) params.push(`message=${encodeURIComponent(message)}`);
  
  if (params.length > 0) {
    uri += `?${params.join('&')}`;
  }
  
  return await generateQRCode(uri);
};

export const generateEthereumQR = async (address, value = null, gas = null) => {
  let uri = `ethereum:${address}`;
  const params = [];
  
  if (value) params.push(`value=${value}`);
  if (gas) params.push(`gas=${gas}`);
  
  if (params.length > 0) {
    uri += `?${params.join('&')}`;
  }
  
  return await generateQRCode(uri);
};
