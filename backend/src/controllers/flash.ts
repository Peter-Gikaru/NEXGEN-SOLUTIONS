import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const listFlashSales = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const flashSales = await prisma.flashSale.findMany({
      where: {
        active: true,
        startTime: { lte: new Date() },
        endTime: { gte: new Date() },
      },
      include: {
        product: true,
      },
    });

    const formattedSales = flashSales.map((sale) => {
      let imageUrlsParsed = [];
      try {
        imageUrlsParsed = JSON.parse(sale.product.imageUrls);
      } catch (e) {
        imageUrlsParsed = [sale.product.imageUrls];
      }

      return {
        id: sale.id,
        productId: sale.productId,
        salePrice: sale.salePrice,
        endTime: sale.endTime,
        product: {
          id: sale.product.id,
          name: sale.product.name,
          slug: sale.product.slug,
          price: sale.product.price,
          compareAtPrice: sale.product.compareAtPrice,
          imageUrls: imageUrlsParsed,
          stock: sale.product.stock,
        },
      };
    });

    return res.json(formattedSales);
  } catch (error) {
    return next(error);
  }
};

export const createFlashSale = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, salePrice, startTime, endTime } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingFlashSale = await prisma.flashSale.findUnique({
      where: { productId },
    });

    if (existingFlashSale) {
      await prisma.flashSale.delete({
        where: { productId },
      });
    }

    const flashSale = await prisma.flashSale.create({
      data: {
        productId,
        salePrice,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        active: true,
      },
    });

    return res.status(201).json(flashSale);
  } catch (error) {
    return next(error);
  }
};
