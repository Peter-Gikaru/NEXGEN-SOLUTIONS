import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { logAction } from '../services/audit';
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
    const { shippingAddress, items, paymentMethod, guestName, guestEmail, expectedSubtotal, promoCode } = req.body;
    const finalShippingAddress = {
      ...shippingAddress,
      guestName,
      guestEmail
    };
    let subtotal = 0;
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
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} units available for ${product.name}`,
        });
      }
      const activeFlashSale = product.flashSale;
      const priceToUse = activeFlashSale ? activeFlashSale.salePrice : product.price;
      subtotal += priceToUse * item.quantity;
      orderItemsData.push({
        productId: product.id,
        price: priceToUse,
        quantity: item.quantity,
      });
    }
    let shippingFee = 500; 
    let expectedDeliveryDate: Date | null = null;
    let estimatedDaysStr = '2 - 3 Business Days';
    if (subtotal >= 50000) {
      shippingFee = 0;
    } 
    if (shippingAddress.city) {
      const zone = await prisma.shippingZone.findFirst({
        where: { regionName: shippingAddress.city }
      });
      if (zone) {
        shippingFee = subtotal >= 50000 ? 0 : zone.fee;
        estimatedDaysStr = zone.estimatedDays;
      } else if (shippingAddress.city.toLowerCase().includes('nairobi')) {
        estimatedDaysStr = 'Next Day Delivery';
      }
    }
    const date = new Date();
    if (estimatedDaysStr.toLowerCase().includes('same')) {
      expectedDeliveryDate = date;
    } else if (estimatedDaysStr.toLowerCase().includes('next')) {
      date.setDate(date.getDate() + 1);
      expectedDeliveryDate = date;
    } else {
      const match = estimatedDaysStr.match(/(\d+)/g);
      if (match && match.length > 0) {
        const maxDays = Math.max(...match.map(Number));
        date.setDate(date.getDate() + maxDays);
        expectedDeliveryDate = date;
      } else {
        date.setDate(date.getDate() + 3);
        expectedDeliveryDate = date;
      }
    }

    let discount = 0;
    let promoCodeId: string | null = null;
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (promo && promo.active && promo.expiryDate > new Date() && promo.usedCount < promo.maxUses) {
        promoCodeId = promo.id;
        if (promo.discountType === 'PERCENTAGE' || promo.discountType === 'PERCENT') {
          discount = subtotal * (promo.discountValue / 100);
        } else if (promo.discountType === 'FIXED' || promo.discountType === 'FLAT') {
          discount = promo.discountValue;
        }
      } else {
        return res.status(400).json({ message: 'Invalid or expired promo code' });
      }
    }
    const totalAmount = Math.max(0, subtotal + shippingFee - discount);

    if (expectedSubtotal !== undefined && Math.abs(subtotal - expectedSubtotal) > 1) {
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
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });
        if (stockUpdate.count !== 1) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }
      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } }
        });
      }
      const newOrder = await tx.order.create({
        data: {
          userId: req.user ? req.user.id : null,
          sessionId: !req.user ? sessionId : null,
          totalAmount,
          subtotal,
          shippingFee,
          discount,
          promoCodeId,
          shippingAddress: finalShippingAddress, 
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          orderStatus: 'PENDING',
          expectedDeliveryDate,
          trackingNumber: `NXG-${Math.floor(100000 + Math.random() * 900000)}`,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true }
          },
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

    if (paymentMethod === 'M-PESA' || paymentMethod === 'MPESA' || paymentMethod === 'M-Pesa') {
      try {
        const { initiateSTKPush } = require('../services/mpesaService');
        const phone = shippingAddress.phoneNumber;
        const response = await initiateSTKPush(phone, totalAmount, order.id);
        
        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id,
            amount: totalAmount,
            provider: 'MPESA',
            checkoutRequestId: response.CheckoutRequestID,
            status: 'PENDING',
          }
        });
        console.log(`[M-PESA] STK Push initiated for order ${order.id}. CheckoutRequestID: ${response.CheckoutRequestID}`);
      } catch (e: any) {
        console.error('[M-PESA] STK Push failed:', e.message);
        
        
      }
    }
    await logAction('ORDER_CREATE', `Created order #${order.id.substring(0, 8).toUpperCase()} with total KES ${order.totalAmount}`, 'INFO', req.user?.id, sessionId, req.ip, req.headers['user-agent'] as string);
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
      return {
        ...order,
        shippingAddress: order.shippingAddress,
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
    return res.json({
      ...order,
      shippingAddress: order.shippingAddress,
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
          const shippingData = order.shippingAddress as any;
          if (shippingData && shippingData.guestEmail && shippingData.guestEmail.toLowerCase() === email.toLowerCase()) {
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
          const shippingData = order.shippingAddress as any;
          if (shippingData && shippingData.guestEmail && shippingData.guestEmail.toLowerCase() === email.toLowerCase()) {
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
    next(error);
  }
};

export const reportDelay = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { expectedDeliveryDate, apologyNote } = req.body;

    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to report delays' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        trackingEvents: {
          create: {
            status: 'DELAYED',
            location: 'System',
            description: apologyNote || 'Your order has been delayed. We apologize for the inconvenience.',
          },
        },
      },
    });

    const email = order.user?.email || (order.shippingAddress as any)?.guestEmail;
    const name = order.user?.name || (order.shippingAddress as any)?.guestName || 'Customer';

    if (email) {
      import('../services/emailService').then(({ sendDelayNotificationEmail }) => {
        sendDelayNotificationEmail(
          email, 
          name, 
          updatedOrder, 
          new Date(expectedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 
          apologyNote
        );
      });
    }

    if (req.user) logAction('REPORT_DELAY', `Reported delay for order ${order.id}`, 'INFO', req.user.id);

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
