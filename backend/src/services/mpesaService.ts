import axios from 'axios';

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' or 'production'
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'your_consumer_key';
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret';
const PASSKEY = process.env.MPESA_PASSKEY || 'your_passkey';
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379'; // default sandbox shortcode
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/payments/mpesa-callback';

const getBaseUrl = () => {
  return MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

export const getMpesaToken = async (): Promise<string> => {
  const url = `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error('M-Pesa Token Error:', error?.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

export const initiateSTKPush = async (phoneNumber: string, amount: number, orderId: string) => {
  const token = await getMpesaToken();
  const url = `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`;
  
  // Format phone number: must be 2547XXXXXXXX
  let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
    formattedPhone = '254' + formattedPhone;
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.substring(1);
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);

  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline', // or CustomerBuyGoodsOnline
    Amount: Math.ceil(amount), // must be integer
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: CALLBACK_URL,
    AccountReference: orderId.substring(0, 12),
    TransactionDesc: 'Laptop Purchase - NexGen',
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // contains CheckoutRequestID
  } catch (error: any) {
    console.error('M-Pesa STK Push Error:', error?.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa STK Push');
  }
};
