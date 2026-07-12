import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export const getActiveVisitors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitors = await prisma.visitorSession.findMany({
      orderBy: { lastSeen: 'desc' },
      take: 50
    });
    return res.json(visitors);
  } catch (error) {
    return next(error);
  }
};

export const getVisitorMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorId } = req.params;
    const session = await prisma.visitorSession.findUnique({
      where: { visitorId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Visitor session not found' });
    }

    return res.json(session.messages);
  } catch (error) {
    return next(error);
  }
};
