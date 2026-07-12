import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const adminNumber = process.env.ADMIN_PHONE_NUMBER || '+254717043408'; 

let client: any = null;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export const sendWhatsAppMessage = async (message: string) => {
  if (!client || !twilioNumber) {
    console.warn('Twilio is not configured. Skipping WhatsApp alert.');
    return;
  }
  
  try {
    await client.messages.create({
      body: message,
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${adminNumber}`
    });
    console.log('WhatsApp alert sent to admin.');
  } catch (error) {
    console.error('Failed to send Twilio WhatsApp message', error);
  }
};
