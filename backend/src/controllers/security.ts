import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const logs = await prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } }
      }
    });

    const total = await prisma.auditLog.count();

    return res.json({
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return next(error);
  }
};

export const getSecurityAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = await prisma.securityAlert.findMany({
      orderBy: [
        { isResolved: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    return res.json(alerts);
  } catch (error) {
    return next(error);
  }
};

export const resolveSecurityAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const alert = await prisma.securityAlert.update({
      where: { id },
      data: { isResolved: true }
    });
    return res.json({ message: 'Alert resolved', alert });
  } catch (error) {
    return next(error);
  }
};
