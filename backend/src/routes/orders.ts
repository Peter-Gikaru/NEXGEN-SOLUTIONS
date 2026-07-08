import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
} from '../controllers/orders';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth';
import { validateBody, orderSchema } from '../utils/validation';

const router = Router();

router.post('/', optionalAuthenticateJWT, validateBody(orderSchema), createOrder);
router.get('/', authenticateJWT, listOrders);
router.get('/:id', authenticateJWT, getOrderDetails);
router.put('/:id/cancel', optionalAuthenticateJWT, cancelOrder);
router.put('/:id/return', optionalAuthenticateJWT, returnOrder);

export default router;
