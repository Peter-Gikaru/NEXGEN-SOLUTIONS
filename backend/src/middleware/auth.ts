import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { logger } from '../utils/logger';
import { generateToken } from '../controllers/auth';

const SERVER_BOOT_TIME = Date.now();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }) as {
      id: string;
      email: string;
      role: string;
      iat: number;
      ip?: string;
      userAgent?: string;
    };

    // 1. Server Restart Invalidation
    if (decoded.iat * 1000 < SERVER_BOOT_TIME) {
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session expired due to server restart. Please login again.' });
    }

    // 2. IP Address Binding
    if (decoded.ip && decoded.ip !== (req.ip || '')) {
      logger.warn(`SECURITY ALERT: Session hijacked or IP changed for ${decoded.email}. Expected IP: ${decoded.ip}, Actual IP: ${req.ip}`);
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session invalid due to IP change. Please login again.' });
    }

    // 3. User-Agent Binding
    if (decoded.userAgent && decoded.userAgent !== (req.headers['user-agent'] as string || '')) {
      logger.warn(`SECURITY ALERT: Session hijacked or User-Agent changed for ${decoded.email}. Expected UA: ${decoded.userAgent}, Actual UA: ${req.headers['user-agent']}`);
      res.clearCookie('token');
      return res.status(401).json({ message: 'Session invalid due to browser mismatch. Please login again.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.status === 'SUSPENDED') {
      if (user?.status === 'SUSPENDED') {
        logger.warn(`SECURITY ALERT: Suspended user ${user.email} attempted API access to ${req.originalUrl} from IP: ${req.ip}`);
      }
      return res.status(403).json({ message: 'Account is suspended or invalid' });
    }

    // Sliding Session: Issue a new token to reset the 20-minute timer
    const newToken = generateToken(
      { id: user.id, email: user.email, role: user.role },
      req.ip || '',
      req.headers['user-agent'] as string || ''
    );
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 60 * 1000, // 20 minutes
    });

    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const optionalAuthenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }) as any;

    if (decoded.iat * 1000 < SERVER_BOOT_TIME) throw new Error('Expired from restart');
    if (decoded.ip && decoded.ip !== (req.ip || '')) throw new Error('IP mismatch');
    if (decoded.userAgent && decoded.userAgent !== (req.headers['user-agent'] as string || '')) throw new Error('UA mismatch');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user && user.status !== 'SUSPENDED') {
      // Sliding Session
      const newToken = generateToken(
        { id: user.id, email: user.email, role: user.role },
        req.ip || '',
        req.headers['user-agent'] as string || ''
      );
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 20 * 60 * 1000,
      });
      req.user = decoded;
    }
    next();
  } catch (error) {
    res.clearCookie('token');
    next();
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`SECURITY ALERT: Unauthorized RBAC access attempt by ${req.user.email} (Role: ${req.user.role}) trying to reach ${req.originalUrl} from IP: ${req.ip}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
