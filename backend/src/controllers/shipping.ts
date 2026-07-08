import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const listShippingZones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { regionName: 'asc' },
    });
    return res.json(zones);
  } catch (error) {
    return next(error);
  }
};

export const createShippingZone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { regionName, fee, estimatedDays } = req.body;
    const zone = await prisma.shippingZone.create({
      data: {
        regionName,
        fee: parseFloat(fee),
        estimatedDays,
      },
    });
    return res.status(201).json(zone);
  } catch (error) {
    return next(error);
  }
};

export const updateShippingZone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { regionName, fee, estimatedDays } = req.body;
    
    const zone = await prisma.shippingZone.update({
      where: { id },
      data: {
        regionName,
        fee: fee !== undefined ? parseFloat(fee) : undefined,
        estimatedDays,
      },
    });
    return res.json(zone);
  } catch (error) {
    return next(error);
  }
};

export const deleteShippingZone = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.shippingZone.delete({
      where: { id },
    });
    return res.json({ message: 'Shipping zone deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
