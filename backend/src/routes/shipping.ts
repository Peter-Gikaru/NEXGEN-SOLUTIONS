import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import {
  listShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone
} from '../controllers/shipping';

const router = Router();

router.get('/', listShippingZones);
router.post('/', authenticateJWT, authorizeRoles('ADMIN'), createShippingZone);
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN'), updateShippingZone);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), deleteShippingZone);

export default router;
