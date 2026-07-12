import { Request, Response } from 'express';
import prisma from '../config/db';

export const getFullAnalytics = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { orderStatus: { not: 'CANCELED' } }
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    const totalOrders = await prisma.order.count();
    const activeUsers = await prisma.user.count();
    const lowStockItems = await prisma.product.count({
      where: { stock: { lte: 5 } }
    });

    
    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        orderStatus: { not: 'CANCELED' }
      },
      select: { totalAmount: true, createdAt: true }
    });

    
    const salesMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesMap[d.toISOString().split('T')[0]] = 0;
    }

    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (salesMap[dateStr] !== undefined) {
        salesMap[dateStr] += o.totalAmount;
      }
    });

    const salesByDay = Object.keys(salesMap).map(date => ({
      date,
      sales: salesMap[date]
    }));

    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const userMap: Record<string, number> = {};
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      userMap[monthStr] = 0;
    }

    recentUsers.forEach(u => {
      const monthStr = u.createdAt.toLocaleString('default', { month: 'short' });
      if (userMap[monthStr] !== undefined) {
        userMap[monthStr]++;
      }
    });

    
    
    const userGrowthData = Object.keys(userMap).map(name => ({
      name,
      users: userMap[name]
    }));

    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    const inventoryCategoryData = categories.map(c => ({
      name: c.name,
      value: c._count.products
    })).filter(c => c.value > 0);

    
    
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    const topSellingData = [];
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId }});
      if (product) {
        topSellingData.push({
          name: product.name,
          sales: item._sum.quantity || 0
        });
      }
    }

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        activeUsers,
        lowStockItems
      },
      salesByDay,
      userGrowthData,
      inventoryCategoryData,
      topSellingData
    });

  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
