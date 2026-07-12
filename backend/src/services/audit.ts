import prisma from '../config/db';

export const logAction = async (
  action: string,
  details: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO',
  userId?: string,
  sessionId?: string,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    
    const log = await prisma.auditLog.create({
      data: {
        action,
        details,
        severity,
        userId: userId || undefined,
        sessionId: sessionId || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
      },
    });

    
    if (action === 'LOGIN_FAILED') {
      
      if (ipAddress) {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const failures = await prisma.auditLog.count({
          where: {
            action: 'LOGIN_FAILED',
            ipAddress,
            createdAt: { gte: fiveMinsAgo },
          },
        });

        if (failures >= 5) {
          await triggerSecurityAlert(
            'BRUTE_FORCE_ATTEMPT',
            `Multiple failed logins (${failures}) detected from IP ${ipAddress} within 5 minutes.`,
            'CRITICAL',
            ipAddress,
            userId
          );
        }
      }
    }

    if (action === 'CART_ADD') {
      
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const condition = sessionId ? { sessionId } : { userId };
      const additions = await prisma.auditLog.count({
        where: {
          action: 'CART_ADD',
          ...condition,
          createdAt: { gte: fiveMinsAgo },
        },
      });

      if (additions >= 50) {
        await triggerSecurityAlert(
          'SUSPICIOUS_CART_ACTIVITY',
          `Massive cart additions (${additions}) detected from ${sessionId ? 'Guest' : 'User'} within 5 minutes.`,
          'HIGH',
          ipAddress,
          userId
        );
      }
    }

  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

export const triggerSecurityAlert = async (
  type: string,
  description: string,
  severity: 'HIGH' | 'CRITICAL' = 'HIGH',
  ipAddress?: string,
  userId?: string
) => {
  try {
    
    const existingAlert = await prisma.securityAlert.findFirst({
      where: {
        type,
        ipAddress,
        isResolved: false,
      },
    });

    if (!existingAlert) {
      await prisma.securityAlert.create({
        data: {
          type,
          description,
          severity,
          ipAddress: ipAddress || undefined,
          userId: userId || undefined,
        },
      });
    }
  } catch (err) {
    console.error('Failed to create security alert:', err);
  }
};
