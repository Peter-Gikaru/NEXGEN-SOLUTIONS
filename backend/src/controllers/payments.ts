import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { initiateSTKPush } from '../services/mpesaService';

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

    const response = await initiateSTKPush(phoneNumber, order.totalAmount, order.id);
    
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        provider: 'MPESA',
        checkoutRequestId: response.CheckoutRequestID,
        status: 'PENDING',
      }
    });

    return res.json({
      message: 'M-Pesa payment request sent to phone. Please enter PIN to complete payment.',
      checkoutRequestId: response.CheckoutRequestID,
    });
  } catch (error) {
    return next(error);
  }
};

export const mpesaCallback = async (req: Request, res: Response) => {
  console.log('--- M-Pesa Webhook Callback Received ---');
  try {
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.warn('Invalid M-Pesa callback payload');
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    console.log(`CheckoutRequestID: ${CheckoutRequestID}, ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);

    const transaction = await prisma.paymentTransaction.findFirst({
      where: { checkoutRequestId: CheckoutRequestID }
    });

    if (!transaction) {
      console.error(`No transaction found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (ResultCode === 0) {
      let mpesaReceiptNumber = '';
      if (CallbackMetadata && CallbackMetadata.Item) {
        const receiptItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
        if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
      }

      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS', providerRef: mpesaReceiptNumber, rawPayload: Body.stkCallback }
        });

        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: 'PAID', orderStatus: 'CONFIRMED', mpesaReceiptNumber }
        });
        
        await tx.trackingEvent.create({
          data: {
            orderId: transaction.orderId,
            status: 'CONFIRMED',
            description: `Payment received via M-Pesa (${mpesaReceiptNumber}). Order confirmed.`
          }
        });
      });
      console.log(`Payment successful for Order ${transaction.orderId}. Receipt: ${mpesaReceiptNumber}`);
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED', errorMessage: ResultDesc, rawPayload: Body.stkCallback }
        });

        await tx.order.update({
          where: { id: transaction.orderId },
          data: { paymentStatus: 'FAILED', paymentAttempts: { increment: 1 } }
        });
      });
      console.log(`Payment failed for Order ${transaction.orderId}. Reason: ${ResultDesc}`);
    }

    return res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
