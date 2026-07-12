import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const createReturnRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, reason, description, imageUrls } = req.body;
    const userId = (req as any).user.id;

    if (!orderId || !reason || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    
    const existingReturn = await prisma.returnRequest.findFirst({
      where: { orderId }
    });

    if (existingReturn) {
      return res.status(400).json({ message: 'A return request for this order already exists' });
    }

    const returnRequest = await prisma.$transaction(async (tx) => {
      const ret = await tx.returnRequest.create({
        data: {
          orderId,
          userId,
          reason,
          description,
          imageUrls,
          status: 'PENDING'
        }
      });

      await tx.order.update({
        where: { id: orderId },
        data: { orderStatus: 'RETURN_REQUESTED' }
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          status: 'RETURN_REQUESTED',
          description: `Return request submitted: ${reason}`
        }
      });

      return ret;
    });

    return res.status(201).json(returnRequest);
  } catch (error) {
    next(error);
  }
};
