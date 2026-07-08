import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
export const trackOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackingNumber, email } = req.query;
    if (!trackingNumber || !email) {
      return res.status(400).json({ message: 'Tracking number and email are required' });
    }
    const order = await prisma.order.findFirst({
      where: {
        trackingNumber: trackingNumber as string,
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    let authorized = false;
    if (order.user && order.user.email.toLowerCase() === (email as string).toLowerCase()) {
      authorized = true;
    } else {
      try {
        const shippingData = JSON.parse(order.shippingAddress);
        if (shippingData.guestEmail && shippingData.guestEmail.toLowerCase() === (email as string).toLowerCase()) {
          authorized = true;
        }
      } catch (e) {
      }
    }
    if (!authorized) {
      return res.status(403).json({ message: 'Email does not match the order' });
    }
    let shippingParsed = {};
    try {
      shippingParsed = JSON.parse(order.shippingAddress);
    } catch (e) {
      shippingParsed = {};
    }
    const sanitizedOrder = {
      id: order.id,
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      shippingAddress: shippingParsed,
      items: order.items.map(item => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          imageUrls: item.product.imageUrls,
          brand: item.product.brand
        }
      }))
    };
    return res.json(sanitizedOrder);
  } catch (error) {
    return next(error);
  }
};
export const recoverTracking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If an account exists with that email, tracking details have been sent.' });
    }
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    if (orders.length > 0) {
      const { sendTrackingRecoveryEmail } = require('../services/emailService');
      await sendTrackingRecoveryEmail(email, orders);
    }
    return res.json({ message: 'If an account exists with that email, tracking details have been sent.' });
  } catch (error) {
    return next(error);
  }
};
