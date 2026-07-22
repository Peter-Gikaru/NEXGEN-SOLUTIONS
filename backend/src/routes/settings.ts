import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get settings (Public)
router.get('/', async (req, res, next) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'global' },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'global',
          storeLocation: 'Not set'
        }
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Update settings (Admin only)
router.put('/', authenticateJWT, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { storeLocation } = req.body;
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'global' },
      update: { storeLocation },
      create: {
        id: 'global',
        storeLocation: storeLocation || 'Not set'
      }
    });

    // Log the admin action
    if (req.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'UPDATE_SETTINGS',
          details: `Updated store location to: ${storeLocation}`,
          ipAddress: req.ip
        }
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

export default router;
