import { Request, Response } from 'express';
import prisma from '../config/db';

export const getFullAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter: any = undefined;
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter = { gte: thirtyDaysAgo };
    }

    const totalRevenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        orderStatus: { not: 'CANCELED' },
        createdAt: dateFilter
      }
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    const totalOrders = await prisma.order.count({ where: { createdAt: dateFilter } });
    const activeUsers = await prisma.user.count({ where: { createdAt: dateFilter } });
    const lowStockItems = await prisma.product.count({
      where: { stock: { lte: 5 } }
    });

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: dateFilter,
        orderStatus: { not: 'CANCELED' }
      },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });

    const salesMap: Record<string, number> = {};
    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (!salesMap[dateStr]) salesMap[dateStr] = 0;
      salesMap[dateStr] += o.totalAmount;
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
      take: 20 // take more since we might filter out some
    });

    const { category } = req.query;
    const topSellingData = [];
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ 
        where: { id: item.productId },
        include: { category: true }
      });
      if (product) {
        if (!category || product.category?.slug === category || product.category?.name === category) {
          topSellingData.push({
            name: product.name,
            sales: item._sum.quantity || 0
          });
          if (topSellingData.length >= 5) break;
        }
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
