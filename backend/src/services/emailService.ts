import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});
const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@nexgen.com';
export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: `"NexGen Laptops" <${fromEmail}>`,
    to: email,
    subject: 'Reset Your Password - NexGen Laptops',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #777;">Or copy and paste this URL into your browser:<br>${resetUrl}</p>
      </div>
    `,
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } else {
      console.log('--- MOCK EMAIL INTERCEPTED ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Password Reset Request`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
export const sendOrderConfirmationEmail = async (email: string, orderDetails: any, trackingNumber: string) => {
  const mailOptions = {
    from: `"NexGen Laptops" <${fromEmail}>`,
    to: email,
    subject: `Order Confirmation - #${orderDetails.id.substring(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for your order!</h2>
        <p>Your order has been received and is currently being processed.</p>
        <p><strong>Tracking Number:</strong> <span style="color: #F59E0B; font-weight: bold; font-size: 18px;">${trackingNumber}</span></p>
        <p>You can use this number on our Track Order page to check your shipment's status.</p>
        <h3>Order Summary</h3>
        <p><strong>Total Amount:</strong> KES ${orderDetails.totalAmount}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
        <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
        <div style="margin-top: 30px; font-size: 12px; color: #777;">
          <p>If you have any questions, please reply to this email.</p>
        </div>
      </div>
    `,
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${email}`);
    } else {
      console.log('--- MOCK EMAIL INTERCEPTED ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Order Confirmation`);
      console.log(`Tracking: ${trackingNumber}`);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};
export const sendTrackingRecoveryEmail = async (email: string, orders: any[]) => {
  const orderItemsHtml = orders.map(o => `
    <li style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <strong>Order #${o.id.substring(0, 8).toUpperCase()}</strong> - Date: ${new Date(o.createdAt).toLocaleDateString()}<br/>
      Total: KES ${o.totalAmount}<br/>
      <span style="color: #F59E0B; font-weight: bold;">Tracking Number: ${o.trackingNumber || 'Processing...'}</span>
    </li>
  `).join('');
  const mailOptions = {
    from: `"NexGen Laptops" <${fromEmail}>`,
    to: email,
    subject: 'Your Tracking Details - NexGen Laptops',
    html: `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Tracking Information</h2>
        <p>You requested the tracking details for orders associated with this email address.</p>
        <ul style="list-style-type: none; padding: 0;">
          ${orderItemsHtml}
        </ul>
        <p style="margin-top: 30px;">Enter your tracking number on our Track Order page to get live updates.</p>
      </div>
    `,
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
      console.log(`Tracking recovery email sent to ${email}`);
    } else {
      console.log('--- MOCK EMAIL INTERCEPTED ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Tracking Details`);
      console.log(`Included ${orders.length} orders`);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error('Error sending tracking recovery email:', error);
  }
};
