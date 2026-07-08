import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendOrderStatusEmail } from '../utils/email';
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    let totalSales = 0;
    let totalOrders = 0;
    let totalUsers = 0;
    let lowStockLaptops: any[] = [];
    const totalSalesGroup = await prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    });
    totalSales = totalSalesGroup._sum.totalAmount || 0;
    totalOrders = await prisma.order.count();
    totalUsers = await prisma.user.count();
    lowStockLaptops = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      include: {
        category: true,
      },
    });
    const formattedLowStock = lowStockLaptops.map((product) => {
      let imageUrlsParsed = [];
      try {
        imageUrlsParsed = JSON.parse(product.imageUrls);
      } catch (e) {
        imageUrlsParsed = [product.imageUrls];
      }
      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        price: product.price,
        category: product.category.name,
        imageUrls: imageUrlsParsed,
      };
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { totalAmount: true, createdAt: true }
    });
    const salesByDayMap: Record<string, number> = {};
    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      salesByDayMap[dateStr] = (salesByDayMap[dateStr] || 0) + o.totalAmount;
    });
    const salesByDay = Object.keys(salesByDayMap).sort().map(date => ({
      date,
      sales: salesByDayMap[date]
    }));
    return res.json({
      stats: {
        totalSales,
        totalOrders,
        totalUsers,
      },
      lowStockProducts: formattedLowStock,
      salesByDay
    });
  } catch (error) {
    return next(error);
  }
};
export const listAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    ]);
    return res.json({
      data: users,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    return next(error);
  }
};
export const updateUserRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (req.user?.id === id) {
      return res.status(400).json({ message: 'Admins cannot change their own roles' });
    }
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};
export const listAllOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;
    const [total, orders] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    ]);
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
    return res.json({
      data: formattedOrders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    return next(error);
  }
};
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { user: true, items: true },
    });
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const dataToUpdate: any = {};
    if (orderStatus) {
      if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'].includes(orderStatus)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      dataToUpdate.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      if (!['PENDING', 'PAID', 'FAILED'].includes(paymentStatus)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      dataToUpdate.paymentStatus = paymentStatus;
    }
    if (trackingNumber) {
      dataToUpdate.trackingNumber = trackingNumber;
    }
    let updatedOrder;
    if (orderStatus === 'CANCELLED' && existingOrder.orderStatus !== 'CANCELLED') {
      updatedOrder = await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        return tx.order.update({
          where: { id },
          data: dataToUpdate,
        });
      });
    } else {
      updatedOrder = await prisma.order.update({
        where: { id },
        data: dataToUpdate,
      });
    }
    if (orderStatus && existingOrder.orderStatus !== orderStatus) {
      let customerEmail = existingOrder.user?.email;
      let customerName = existingOrder.user?.name || 'Customer';
      if (!customerEmail) {
        try {
          const shipping = JSON.parse(existingOrder.shippingAddress);
          customerEmail = shipping.guestEmail;
          customerName = shipping.guestName || 'Customer';
        } catch (e) {}
      }
      if (customerEmail) {
        sendOrderStatusEmail(customerEmail, id, orderStatus, customerName).catch(console.error);
      }
    }
    return res.json(updatedOrder);
  } catch (error) {
    return next(error);
  }
};
export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (req.user?.id === id) {
      return res.status(400).json({ message: 'Admins cannot suspend themselves' });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });
    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};
export const createUserByAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password, role } = req.body;
    if (role !== 'ADMIN') {
      return res.status(400).json({ message: 'Only ADMIN accounts can be provisioned by admins' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character' });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};
export const exportOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const orders = await prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    const csvHeaders = "Order ID,Date,User Email,Total Amount,Payment Method,Payment Status,Order Status\n";
    const csvRows = orders.map(o => {
      return `"${o.id}","${o.createdAt.toISOString()}","${o.user?.email || 'Guest'}","${o.totalAmount}","${o.paymentMethod}","${o.paymentStatus}","${o.orderStatus}"`;
    }).join("\n");
    const csvContent = csvHeaders + csvRows;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
};
