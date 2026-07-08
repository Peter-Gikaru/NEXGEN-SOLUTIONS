import prisma from '../config/db';

export const logAdminAction = async (
  adminId: string,
  action: string,
  details: string,
  ipAddress?: string
) => {
  try {
    await prisma.adminLog.create({
      data: {
        adminId,
        action,
        details,
        ipAddress: ipAddress || 'Unknown',
      },
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
