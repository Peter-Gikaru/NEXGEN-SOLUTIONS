import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
export const getAdminLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: {
          select: { name: true, email: true, role: true },
        },
      },
    });
    return res.json(logs);
  } catch (error) {
    return next(error);
  }
};
