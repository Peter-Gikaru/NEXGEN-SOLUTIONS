import { Router } from 'express';
import {
  createOrder,
  listOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
  reportDelay,
} from '../controllers/orders';
import { authenticateJWT, optionalAuthenticateJWT } from '../middleware/auth';
import { validateBody, orderSchema } from '../utils/validation';
import { validateSession } from '../middleware/session';
import { emailLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(validateSession);

router.post('/', emailLimiter, optionalAuthenticateJWT, validateBody(orderSchema), createOrder);
router.get('/', authenticateJWT, listOrders);
router.get('/:id', authenticateJWT, getOrderDetails);
router.put('/:id/cancel', optionalAuthenticateJWT, cancelOrder);
router.put('/:id/return', optionalAuthenticateJWT, returnOrder);
router.put('/:id/delay', authenticateJWT, reportDelay);

export default router;
