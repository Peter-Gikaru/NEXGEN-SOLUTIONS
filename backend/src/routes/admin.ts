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
} from '../controllers/admin';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/stats', authorizeRoles('ADMIN'), getDashboardStats);
router.get('/orders', authorizeRoles('ADMIN'), listAllOrders);
router.get('/orders/export', authorizeRoles('ADMIN'), exportOrders);
router.put('/orders/:id', authorizeRoles('ADMIN'), updateOrderStatus);

router.get('/users', authorizeRoles('ADMIN'), listAllUsers);
router.post('/users', authorizeRoles('ADMIN'), createUserByAdmin);
router.put('/users/:id/role', authorizeRoles('ADMIN'), updateUserRole);
router.put('/users/:id/status', authorizeRoles('ADMIN'), updateUserStatus);

export default router;

