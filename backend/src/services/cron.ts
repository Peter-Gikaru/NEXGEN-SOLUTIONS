import cron from 'node-cron';
import prisma from '../config/db';
import { sendAbandonedCartEmail } from './emailService';

export const initCronJobs = () => {
  
  cron.schedule('*/10 * * * *', async () => {
    console.log('[CRON] Running unpaid orders timeout check...');
    try {
      
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const expiredOrders = await prisma.order.findMany({
        where: {
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          createdAt: {
            lt: thirtyMinutesAgo
          }
        },
        include: {
          items: true
        }
      });

      if (expiredOrders.length > 0) {
        console.log(`[CRON] Found ${expiredOrders.length} expired unpaid orders. Cancelling...`);
        
        for (const order of expiredOrders) {
          await prisma.$transaction(async (tx) => {
            
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'FAILED',
                orderStatus: 'CANCELLED',
                cancellationReason: 'Payment Timeout (30 minutes)'
              }
            });

            
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: { increment: item.quantity }
                }
              });
            }

            
            await tx.trackingEvent.create({
              data: {
                orderId: order.id,
                status: 'CANCELLED',
                description: 'Order cancelled automatically due to payment timeout.'
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('[CRON] Error during unpaid orders check:', error);
    }
  });

  
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running abandoned cart check...');
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const abandonedCarts = await prisma.cart.findMany({
        where: {
          updatedAt: { lt: twoHoursAgo, gt: twentyFourHoursAgo },
          abandonedEmailSent: false,
          OR: [
            { userId: { not: null } },
            { guestEmail: { not: null } }
          ],
          items: { some: {} }
        },
        include: { user: true, items: { include: { product: true } } }
      });

      if (abandonedCarts.length > 0) {
        console.log(`[CRON] Found ${abandonedCarts.length} abandoned carts.`);

        const activePromo = await prisma.promoCode.findFirst({
          where: { active: true, isForAbandonedCart: true }
        });

        for (const cart of abandonedCarts) {
          const emailAddress = cart.user?.email || cart.guestEmail;
          if (emailAddress) {
            console.log(`[CRON] Sending abandoned cart email to ${emailAddress}`);
            await sendAbandonedCartEmail(emailAddress, cart.items, activePromo || undefined);
            
            await prisma.cart.update({
              where: { id: cart.id },
              data: { abandonedEmailSent: true }
            });
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error during abandoned cart check:', error);
    }
  });

  
  cron.schedule('0 12 * * *', async () => {
    console.log('[CRON] Running price drop alerts check...');
    try {
      const alerts = await prisma.priceDropAlert.findMany({
        where: { isNotified: false },
        include: { product: true, user: true }
      });

      const triggeredAlerts = alerts.filter(alert => {
        if (!alert.targetPrice) return true; 
        return alert.product.price <= alert.targetPrice;
      });

      if (triggeredAlerts.length > 0) {
        console.log(`[CRON] Triggering ${triggeredAlerts.length} price drop alerts.`);
        for (const alert of triggeredAlerts) {
          if (alert.user?.email) {
            
            console.log(`[CRON] Sending price drop alert for ${alert.product.name} to ${alert.user.email}`);
            await prisma.priceDropAlert.update({
              where: { id: alert.id },
              data: { isNotified: true }
            });
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error during price drop check:', error);
    }
  });

  
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running post-purchase review check...');
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      const deliveredOrders = await prisma.order.findMany({
        where: {
          orderStatus: 'DELIVERED',
          updatedAt: { lt: sevenDaysAgo, gt: eightDaysAgo }, 
          userId: { not: null }
        },
        include: { user: true, items: { include: { product: true } } }
      });

      if (deliveredOrders.length > 0) {
        console.log(`[CRON] Sending review requests for ${deliveredOrders.length} orders.`);
        for (const order of deliveredOrders) {
          if (order.user?.email) {
            
            console.log(`[CRON] Sending "Review your purchase" email to ${order.user.email} for order ${order.id}`);
          }
        }
      }
    } catch (error) {
      console.error('[CRON] Error during post-purchase review check:', error);
    }
  });

  // 5. Daily database backup task (at 2:00 AM)
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running daily database backup...');
    try {
      const { runBackup } = await import('./backup');
      await runBackup();
    } catch (error) {
      console.error('[CRON] Failed to run daily backup:', error);
    }
  });

  console.log('Cron jobs initialized');
};
