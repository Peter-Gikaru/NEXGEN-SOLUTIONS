import { Router } from 'express';
import {
  getDashboardStats,
  listAllUsers,
  updateUserRole,
  listAllOrders,
  updateOrderStatus,
  updateUserStatus,
  createUserByAdmin,
  exportOrders,
  getAdminReturns,
  updateAdminReturn,
  getAdminWarranties,
  updateAdminWarranty,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon
} from '../controllers/admin';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { getFullAnalytics } from '../controllers/analytics';
import { getAuditLogs, getSecurityAlerts, resolveSecurityAlert } from '../controllers/security';
import { generateDynamicReport } from '../controllers/reports';

const router = Router();

router.use(authenticateJWT);

router.get('/security/logs', authorizeRoles('ADMIN'), getAuditLogs);
router.get('/security/alerts', authorizeRoles('ADMIN'), getSecurityAlerts);
router.put('/security/alerts/:id/resolve', authorizeRoles('ADMIN'), resolveSecurityAlert);
router.post('/reports/dynamic', authorizeRoles('ADMIN'), generateDynamicReport);
router.get('/analytics/full', authorizeRoles('ADMIN'), getFullAnalytics);
router.get('/stats', authorizeRoles('ADMIN'), getDashboardStats);
router.get('/orders', authorizeRoles('ADMIN'), listAllOrders);
router.get('/orders/export', authorizeRoles('ADMIN'), exportOrders);
router.put('/orders/:id', authorizeRoles('ADMIN'), updateOrderStatus);

router.get('/users', authorizeRoles('ADMIN'), listAllUsers);
router.post('/users', authorizeRoles('ADMIN'), createUserByAdmin);
router.put('/users/:id/role', authorizeRoles('ADMIN'), updateUserRole);
router.put('/users/:id/status', authorizeRoles('ADMIN'), updateUserStatus);

router.get('/returns', authorizeRoles('ADMIN'), getAdminReturns);
router.put('/returns/:id', authorizeRoles('ADMIN'), updateAdminReturn);

router.get('/warranties', authorizeRoles('ADMIN'), getAdminWarranties);
router.put('/warranties/:id', authorizeRoles('ADMIN'), updateAdminWarranty);

router.get('/coupons', authorizeRoles('ADMIN'), getAdminCoupons);
router.post('/coupons', authorizeRoles('ADMIN'), createAdminCoupon);
router.put('/coupons/:id', authorizeRoles('ADMIN'), updateAdminCoupon);

export default router;

