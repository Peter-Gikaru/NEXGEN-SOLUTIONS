import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const validatePromo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.body;

    const promo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!promo.active) {
      return res.status(400).json({ message: 'Coupon code is inactive' });
    }

    if (new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon code has expired' });
    }

    if (promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ message: 'Coupon code usage limit exceeded' });
    }

    return res.json({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });
  } catch (error) {
    return next(error);
  }
};

export const createPromo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, discountType, discountValue, maxUses, expiryDate, isForAbandonedCart } = req.body;

    const existingPromo = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existingPromo) {
      return res.status(400).json({ message: 'Promo code already exists' });
    }

    const promo = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue,
        maxUses: maxUses || 100,
        expiryDate: new Date(expiryDate),
        active: true,
        isForAbandonedCart: isForAbandonedCart || false,
      },
    });

    return res.status(201).json(promo);
  } catch (error) {
    return next(error);
  }
};

export const updatePromo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { code, discountType, discountValue, maxUses, expiryDate, active, isForAbandonedCart } = req.body;

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        code,
        discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses),
        expiryDate: new Date(expiryDate),
        active,
        isForAbandonedCart,
      }
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const deletePromo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.promoCode.delete({ where: { id } });
    return res.json({ message: 'Promo deleted' });
  } catch (error) {
    return next(error);
  }
};
