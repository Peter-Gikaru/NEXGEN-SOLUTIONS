export const sendOrderStatusEmail = async (
  email: string,
  orderId: string,
  status: string,
  customerName: string = 'Customer'
) => {
  let message = '';
  switch (status) {
    case 'CONFIRMED':
      message = 'Your order has been confirmed and is currently being processed.';
      break;
    case 'SHIPPED':
      message = 'Good news! Your order has shipped and is on its way to you.';
      break;
    case 'DELIVERED':
      message = 'Your order has been delivered! Enjoy your premium notebook.';
      break;
    case 'CANCELLED':
      message = 'Your order has been cancelled successfully. If you have already paid, a refund will be processed.';
      break;
    case 'RETURN_REQUESTED':
      message = 'We have received your return request. Our team will contact you shortly with return instructions.';
      break;
    case 'RETURNED':
      message = 'Your return has been completed and any applicable refunds have been issued.';
      break;
    default:
      message = `Your order status has been updated to: ${status}.`;
  }
  const emailHtml = `
    ========================================================
    EMAIL DISPATCH SIMULATOR (NexGen E-Commerce)
    ========================================================
    TO: ${email}
    SUBJECT: Update on your Order #${orderId.slice(0, 8)}
    Hi ${customerName},
    ${message}
    Track your order status anytime at: 
    http://localhost:5173/track
    Thank you for shopping with NexGen!
    ========================================================
  `;
  console.log(emailHtml);
  return true;
};
