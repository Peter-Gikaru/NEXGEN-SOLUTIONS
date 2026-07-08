import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { productId, rating, serviceRating, comment, imageUrls } = req.body;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { slug: productId }
        ]
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const existingOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        orderStatus: 'DELIVERED',
        items: {
          some: {
            productId: product.id,
          },
        },
      },
    });
    if (!existingOrderWithProduct) {
      return res.status(403).json({ message: 'You can only review products after they have been delivered to you.' });
    }
    const sanitizedComment = comment
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId: product.id,
        rating,
        serviceRating,
        comment: sanitizedComment,
        imageUrls: imageUrls || null,
        verifiedPurchase: true,
      },
    });
    return res.status(201).json(review);
  } catch (error) {
    return next(error);
  }
};
export const listProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { slug: productId }
        ]
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json(reviews);
  } catch (error) {
    return next(error);
  }
};
export const checkCanReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.json({ canReview: false });
    }
    const { productId } = req.params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { slug: productId }
        ]
      },
    });
    if (!product) {
      return res.json({ canReview: false });
    }
    const existingOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        orderStatus: 'DELIVERED',
        items: {
          some: {
            productId: product.id,
          },
        },
      },
    });
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        productId: product.id
      }
    });
    if (existingReview) {
      return res.json({ canReview: false, message: 'You have already reviewed this product.' });
    }
    return res.json({ canReview: !!existingOrderWithProduct });
  } catch (error) {
    return next(error);
  }
};
