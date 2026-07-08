import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
export const getAdminLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, 
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
};
