import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const initiateMpesaPush = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { orderId, phoneNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const checkoutRequestId = `ws_CO_${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(async () => {
      try {
        const mockCallbackPayload = {
          Body: {
            stkCallback: {
              CheckoutRequestID: checkoutRequestId,
              ResultCode: 0,
              ResultDesc: 'The service request is processed successfully.',
              CallbackMetadata: {
                Item: [
                  { Name: 'Amount', Value: order.totalAmount },
                  { Name: 'MpesaReceiptNumber', Value: `RC_${Math.random().toString(36).substring(2, 10).toUpperCase()}` },
                  { Name: 'TransactionDate', Value: Date.now() },
                  { Name: 'PhoneNumber', Value: phoneNumber },
                ],
              },
            },
          },
        };

        const receiptItem = mockCallbackPayload.Body.stkCallback.CallbackMetadata.Item.find(
          (item) => item.Name === 'MpesaReceiptNumber'
        );
        const receipt = receiptItem ? receiptItem.Value : 'MPESARECEIPT';

        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
            mpesaReceiptNumber: receipt,
          },
        });
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return res.json({
      message: 'Mpesa payment request sent to phone. Please enter PIN to complete payment.',
      checkoutRequestId,
    });
  } catch (error) {
    return next(error);
  }
};

export const mpesaCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const callbackHeader = req.headers['x-mpesa-token'];
    const securityToken = process.env.MPESA_CALLBACK_TOKEN || 'secure-webhook-token';

    if (callbackHeader !== securityToken) {
      return res.status(401).json({ message: 'Unauthorized callback origin' });
    }

    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ message: 'Invalid callback payload' });
    }

    const callback = Body.stkCallback;
    if (callback.ResultCode !== 0) {
      return res.json({ message: 'Payment cancelled or failed' });
    }

    return res.json({ message: 'Callback received' });
  } catch (error) {
    return next(error);
  }
};
