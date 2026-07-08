import { Router } from 'express';
import { validatePromo, createPromo } from '../controllers/promo';
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

export default router;
