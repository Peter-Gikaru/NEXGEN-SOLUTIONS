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
const appUrl = process.env.FRONTEND_URL;
if (!appUrl) {
  throw new Error('FRONTEND_URL must be configured for email links.');
}

const generateEmailLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  .header { background-color: #0f172a; padding: 20px; text-align: center; }
  .header h1 { color: #f59e0b; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
  .nav { background-color: #1e293b; color: #94a3b8; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .nav span { margin: 0 10px; color: #e2e8f0; }
  .content { padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 15px; }
  .content h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
  .order-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin: 20px 0; }
  .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 30px 20px; text-align: center; font-size: 13px; color: #64748b; }
  .social-icons { margin-top: 20px; }
  .social-icons span { margin: 0 12px; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 11px; }
  .table { width: 100%; border-collapse: collapse; margin-top: 25px; }
  .table th { background-color: #f1f5f9; padding: 12px; text-align: left; font-size: 13px; color: #475569; border-bottom: 2px solid #cbd5e1; }
  .table td { padding: 15px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
  .item-img { width: 60px; height: 60px; object-fit: contain; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px; }
  .btn { display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 25px; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>NEXGEN GADGETS</h1>
    </div>
    <div class="nav">
      <span>Laptops</span> | <span>Desktops</span> | <span>Accessories</span> | <span>Printers</span> | <span>Gadgets</span>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="font-weight: 600; color: #334155; font-size: 14px;">Got any questions?</p>
      <p>Have a look at our <a href="${appUrl}/faq" style="color:#f59e0b; font-weight: 600; text-decoration: none;">Help Center page</a></p>
      <p style="margin-top: 20px; font-size: 11px; color: #94a3b8; max-width: 400px; margin-left: auto; margin-right: auto;">
        NexGen Gadgets will never ask you for your password, PIN, CVV or full card details over the phone or via email.
      </p>
      <div class="social-icons">
        <span>Instagram</span> <span>Facebook</span> <span>Twitter</span> <span>Youtube</span>
      </div>
    </div>
  </div>
</body>
</html>
`;

const renderItemsTable = (items: any[]) => {
  if (!items || items.length === 0) return '';
  let rows = items.map(item => {
    let imgUrl = '';
    let name = `Product ID: ${item.productId}`;
    if (item.product) {
      name = item.product.name;
      if (item.product.imageUrls) {
        imgUrl = item.product.imageUrls.split(',')[0];
      }
    }
    return `
      <tr>
        <td style="width: 70px;">${imgUrl ? `<img src="${imgUrl}" class="item-img" />` : ''}</td>
        <td style="font-size: 14px; font-weight: 500; color: #0f172a;">${name}</td>
        <td style="text-align: center; font-weight: 600; color: #475569;">${item.quantity}</td>
        <td style="font-weight: 700; color: #0f172a; text-align: right;">Ksh ${item.price || item.priceAtAddition}</td>
      </tr>
    `;
  }).join('');

  return `
    <table class="table">
      <thead>
        <tr>
          <th colspan="2">Item</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

const formatAddress = (address: unknown) => {
  try {
    const addr = typeof address === 'string' ? JSON.parse(address) : address as any;
    if (addr.guestName) {
      return `${addr.guestName}<br>${addr.city}, ${addr.area}<br>${addr.detailedAddress}<br>${addr.phoneNumber}`;
    }
    return `${addr.city}, ${addr.area}<br>${addr.detailedAddress}<br>${addr.phoneNumber}`;
  } catch (e) {
    return typeof address === 'string' ? address : '';
  }
};

export const sendOrderConfirmationEmail = async (email: string, orderDetails: any, trackingNumber: string) => {
  const addressHtml = formatAddress(orderDetails.shippingAddress);
  const content = `
    <h2>Thank you for your order!</h2>
    <p>We've received your order and are currently processing it.</p>
    
    <div class="order-box">
      <p style="margin-top: 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700;">Delivery Address</p>
      <p style="font-weight: 500;">${addressHtml}</p>
      
      <p style="margin-top: 20px; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700;">Tracking Details</p>
      <p style="margin: 0;">
        Tracking Number: <strong style="color: #f59e0b; font-size: 18px;">${trackingNumber}</strong>
      </p>
    </div>

    ${renderItemsTable(orderDetails.items)}

    <div style="text-align: right; margin-top: 20px; font-size: 18px;">
      Total Amount: <strong style="color: #0f172a;">Ksh ${orderDetails.totalAmount}</strong>
    </div>

    <center>
      <a href="${appUrl}/track" class="btn">Track Your Order</a>
    </center>
  `;

  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    to: email,
    subject: `Order Confirmation - #${orderDetails.id.substring(0, 8).toUpperCase()}`,
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
    } else {
      console.log('--- MOCK EMAIL INTERCEPTED ---');
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

export const sendOrderStatusEmail = async (email: string, order: any, status: string, name: string) => {
  let statusMessage = '';
  switch (status) {
    case 'CONFIRMED': statusMessage = 'has been confirmed and is currently processing.'; break;
    case 'SHIPPED': statusMessage = 'has been shipped and is on its way to you!'; break;
    case 'DELIVERED': statusMessage = 'has been delivered. We hope you enjoy your new gadget!'; break;
    case 'CANCELLED': statusMessage = 'has been cancelled. If you have been charged, a refund will be processed shortly.'; break;
    case 'RETURN_REQUESTED': statusMessage = 'has a return request pending. Our team will review it and get back to you.'; break;
    case 'RETURNED': statusMessage = 'has been successfully returned and processed.'; break;
    default: statusMessage = `status has been updated to: ${status}`;
  }
  
  const addressHtml = formatAddress(order.shippingAddress);
  const trackingNumber = order.trackingNumber || 'Processing...';

  const content = `
    <h2>Hi ${name},</h2>
    <p>This is an update regarding your package <strong style="color:#0f172a;">${trackingNumber}</strong>.</p>
    <p style="font-size: 18px; font-weight: 500; color: #f59e0b; margin: 20px 0;">
      Your order ${statusMessage}
    </p>

    <div class="order-box">
      <p style="margin-top: 0; color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 700;">Delivery Details</p>
      <p style="font-weight: 500;">${addressHtml}</p>
    </div>

    ${renderItemsTable(order.items)}

    <div style="text-align: right; margin-top: 20px; font-size: 18px;">
      Total Amount: <strong style="color: #0f172a;">Ksh ${order.totalAmount}</strong>
    </div>

    <center>
      <a href="${appUrl}/track" class="btn">Track Your Package</a>
    </center>
  `;

  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    to: email,
    subject: `Order Update - #${order.id.substring(0, 8).toUpperCase()}`,
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending order status email:', error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
    <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
    <center>
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </center>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; word-break: break-all;">Or copy and paste this URL into your browser:<br>${resetUrl}</p>
  `;
  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    to: email,
    subject: 'Reset Your Password - NexGen Gadgets',
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') await transporter.sendMail(mailOptions);
  } catch (error) {}
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const content = `
    <h2>Welcome to NexGen Gadgets, ${name}!</h2>
    <p>We are thrilled to have you join us.</p>
    <p>You can now save your addresses, track your orders easily, and enjoy faster checkout on all our premium tech products.</p>
    <center>
      <a href="${appUrl}/orders" class="btn">Complete Your Profile</a>
    </center>
  `;
  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    to: email,
    subject: 'Welcome to NexGen Gadgets!',
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') await transporter.sendMail(mailOptions);
  } catch (error) {}
};

export const sendTrackingRecoveryEmail = async (email: string, orders: any[]) => {
  const orderItemsHtml = orders.map(o => `
    <div class="order-box">
      <strong>Order #${o.id.substring(0, 8).toUpperCase()}</strong> - Date: ${new Date(o.createdAt).toLocaleDateString()}<br/>
      Total: Ksh ${o.totalAmount}<br/>
      <span style="color: #f59e0b; font-weight: bold; display: inline-block; margin-top: 10px;">Tracking Number: ${o.trackingNumber || 'Processing...'}</span>
    </div>
  `).join('');

  const content = `
    <h2>Your Tracking Information</h2>
    <p>You requested the tracking details for orders associated with this email address.</p>
    ${orderItemsHtml}
    <p>Enter your tracking number on our Track Order page to get live updates.</p>
    <center>
      <a href="${appUrl}/track" class="btn">Track Orders</a>
    </center>
  `;
  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    to: email,
    subject: 'Your Tracking Details - NexGen Gadgets',
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') await transporter.sendMail(mailOptions);
  } catch (error) {}
};

export const sendPasswordChangedAlertEmail = async (email: string) => {
  const content = `
    <h2 style="color: #ef4444;">Security Alert</h2>
    <p>Your NexGen Gadgets account password was recently changed.</p>
    <p>If you performed this action, you can safely ignore this email.</p>
    <p><strong>If you did NOT change your password</strong>, please contact support immediately to secure your account.</p>
  `;
  const mailOptions = {
    from: `"NexGen Security" <${fromEmail}>`,
    to: email,
    subject: 'Security Alert: Password Changed',
    html: generateEmailLayout(content),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') await transporter.sendMail(mailOptions);
  } catch (error) {}
};

export const sendPromotionalEmail = async (emails: string[], subject: string, htmlContent: string) => {
  const mailOptions = {
    from: `"NexGen Gadgets" <${fromEmail}>`,
    bcc: emails, // Use BCC to hide recipients from each other
    subject: subject,
    html: generateEmailLayout(`
      <div style="font-size: 16px; color: #334155; line-height: 1.6;">
        ${htmlContent}
      </div>
    `),
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
      console.log(`Promotional email "${subject}" sent to ${emails.length} subscribers.`);
    }
  } catch (error) {
    console.error('Error sending promotional email:', error);
  }
};

export const sendAdminAlertEmail = async (subject: string, text: string) => {
  const mailOptions = {
    from: `"NexGen System" <${fromEmail}>`,
    to: process.env.ADMIN_EMAIL || 'admin@nexgen.com',
    subject: subject,
    text: text,
  };
  try {
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'mock_user') {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[MOCK EMAIL] Admin Alert: ${subject} - ${text}`);
    }
  } catch (error) {
    console.error('Error sending admin alert email:', error);
  }
};
