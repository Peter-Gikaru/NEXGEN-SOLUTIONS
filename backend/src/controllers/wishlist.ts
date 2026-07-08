import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
export const getWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    if (!userId && !sessionId) {
      return res.json([]);
    }
    const whereClause = userId ? { userId } : { sessionId };
    const wishlist = await prisma.wishlist.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            category: true,
            flashSale: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(wishlist.map(w => w.product));
  } catch (error) {
    return next(error);
  }
};
export const toggleWishlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'Session ID required for guests' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found in database. This might happen if you are trying to add a product from an old cache or local storage after a database reset.' });
    }
    let existing;
    if (userId) {
      existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } });
    } else {
      existing = await prisma.wishlist.findUnique({ where: { sessionId_productId: { sessionId: sessionId!, productId } } });
    }
    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ message: 'Removed from wishlist', added: false });
    } else {
      await prisma.wishlist.create({
        data: {
          productId,
          userId: userId || null,
          sessionId: userId ? null : sessionId,
        }
      });
      return res.json({ message: 'Added to wishlist', added: true });
    }
  } catch (error) {
    return next(error);
  }
};
export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'] as string;
    const whereClause = userId ? { userId } : (sessionId ? { sessionId } : null);
    let categoryIds: string[] = [];
    let excludedProductIds: string[] = [];
    if (whereClause) {
      const wishlistItems = await prisma.wishlist.findMany({
        where: whereClause,
        include: { product: true }
      });
      categoryIds = [...new Set(wishlistItems.map(item => item.product.categoryId))];
      excludedProductIds = wishlistItems.map(item => item.productId);
    }
    let recommendations: any[] = [];
    if (categoryIds.length > 0) {
      recommendations = await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          id: { notIn: excludedProductIds },
          isActive: true
        },
        include: {
          category: true,
          flashSale: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' }
      });
    }
    if (!recommendations || recommendations.length < 4) {
      const moreProducts = await prisma.product.findMany({
        where: {
          id: { notIn: [...excludedProductIds, ...(recommendations?.map(r => r.id) || [])] },
          isActive: true
        },
        include: {
          category: true,
          flashSale: true,
        },
        take: 8 - (recommendations?.length || 0),
        orderBy: { stock: 'desc' }
      });
      recommendations = [...(recommendations || []), ...moreProducts];
    }
    return res.json(recommendations);
  } catch (error) {
    return next(error);
  }
};
