import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendOrderConfirmationEmail } from '../services/emailService';
export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }
    const { shippingAddress, items, paymentMethod, guestName, guestEmail, expectedSubtotal } = req.body;
    const finalShippingAddress = {
      ...shippingAddress,
      guestName,
      guestEmail
    };
    let totalAmount = 0;
    const orderItemsData: { productId: string; price: number; quantity: number }[] = [];
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.productId },
            { slug: item.productId }
          ]
        },
        include: {
          flashSale: {
            where: {
              active: true,
              startTime: { lte: new Date() },
              endTime: { gte: new Date() },
            },
          },
        },
      });
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      const activeFlashSale = product.flashSale;
      const priceToUse = activeFlashSale ? activeFlashSale.salePrice : product.price;
      totalAmount += priceToUse * item.quantity;
      orderItemsData.push({
        productId: product.id,
        price: priceToUse,
        quantity: item.quantity,
      });
    }
    if (expectedSubtotal !== undefined && Math.abs(totalAmount - expectedSubtotal) > 1) {
      return res.status(400).json({ message: 'Cart prices have changed (e.g. Flash sale expired). Please refresh your cart.' });
    }
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findFirst({
          where: {
            OR: [
              { id: item.productId },
              { slug: item.productId }
            ]
          }
        });
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
      const newOrder = await tx.order.create({
        data: {
          userId: req.user ? req.user.id : null,
          sessionId: !req.user ? sessionId : null,
          totalAmount,
          shippingAddress: JSON.stringify(finalShippingAddress),
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          orderStatus: 'PENDING',
          trackingNumber: `NXG-${Math.floor(100000 + Math.random() * 900000)}`,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });
      let cart;
      if (req.user) {
        cart = await tx.cart.findUnique({
          where: { userId: req.user.id },
        });
      } else {
        cart = await tx.cart.findUnique({
          where: { sessionId },
        });
      }
      if (cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
      if (req.user) {
        const pointsToAward = Math.floor(totalAmount / 100);
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            rewardPoints: { increment: pointsToAward }
          }
        });
      }
      return newOrder;
    });
    const email = req.user ? req.user.email : guestEmail;
    if (email) {
      await sendOrderConfirmationEmail(email, order, order.trackingNumber || '');
    }
    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
};
export const listOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const formattedOrders = orders.map((order) => {
      let shippingParsed = {};
      try {
        shippingParsed = JSON.parse(order.shippingAddress);
      } catch (e) {
        shippingParsed = {};
      }
      return {
        ...order,
        shippingAddress: shippingParsed,
      };
    });
    return res.json(formattedOrders);
  } catch (error) {
    return next(error);
  }
};
export const getOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
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
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }
    let shippingParsed = {};
    try {
      shippingParsed = JSON.parse(order.shippingAddress);
    } catch (e) {
      shippingParsed = {};
    }
    return res.json({
      ...order,
      shippingAddress: shippingParsed,
    });
  } catch (error) {
    return next(error);
  }
};
export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const user = (req as any).user;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (user) {
      if (order.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      if (!email) {
        return res.status(401).json({ message: 'Authentication or email required' });
      }
      let authorized = false;
      if (order.user && order.user.email.toLowerCase() === email.toLowerCase()) {
        authorized = true;
      } else {
        try {
          const shippingData = JSON.parse(order.shippingAddress);
          if (shippingData.guestEmail && shippingData.guestEmail.toLowerCase() === email.toLowerCase()) {
            authorized = true;
          }
        } catch (e) {}
      }
      if (!authorized) {
        return res.status(403).json({ message: 'Access denied: Email does not match' });
      }
    }
    if (order.orderStatus !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
      await tx.order.update({
        where: { id },
        data: {
          orderStatus: 'CANCELLED',
        },
      });
    });
    return res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    return next(error);
  }
};
export const returnOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const user = (req as any).user;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (user) {
      if (order.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      if (!email) {
        return res.status(401).json({ message: 'Authentication or email required' });
      }
      let authorized = false;
      if (order.user && order.user.email.toLowerCase() === email.toLowerCase()) {
        authorized = true;
      } else {
        try {
          const shippingData = JSON.parse(order.shippingAddress);
          if (shippingData.guestEmail && shippingData.guestEmail.toLowerCase() === email.toLowerCase()) {
            authorized = true;
          }
        } catch (e) {}
      }
      if (!authorized) {
        return res.status(403).json({ message: 'Access denied: Email does not match' });
      }
    }
    if (order.orderStatus !== 'DELIVERED') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: 'RETURN_REQUESTED',
      },
    });
    return res.json(updatedOrder);
  } catch (error) {
    return next(error);
  }
};
