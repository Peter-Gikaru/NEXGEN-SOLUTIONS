import { Router } from 'express';
import { validatePromo, createPromo, updatePromo, deletePromo } from '../controllers/promo';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { validateBody, promoCodeSchema } from '../utils/validation';

const router = Router();

router.post('/validate', authenticateJWT, validatePromo);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBody(promoCodeSchema),
  createPromo
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  updatePromo
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  deletePromo
);

export default router;
