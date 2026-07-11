import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const createWarrantyClaim = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, productId, issueType, description, imageUrls } = req.body;
    const userId = (req as any).user.id;

    if (!orderId || !productId || !issueType || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({ message: 'Only delivered items are eligible for warranty claims' });
    }

    // Check if the product was actually in this order
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        orderId,
        productId
      }
    });

    if (!orderItem) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    const existingClaim = await prisma.warrantyClaim.findFirst({
      where: { orderId, productId, status: { notIn: ['RESOLVED', 'REJECTED'] } }
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'An active warranty claim already exists for this product in this order' });
    }

    const warrantyClaim = await prisma.warrantyClaim.create({
      data: {
        orderId,
        productId,
        userId,
        issueType,
        description,
        imageUrls,
        status: 'PENDING'
      }
    });

    return res.status(201).json(warrantyClaim);
  } catch (error) {
    next(error);
  }
};
