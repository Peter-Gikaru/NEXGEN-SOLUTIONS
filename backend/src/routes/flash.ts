import { Router } from 'express';
import { listFlashSales, createFlashSale } from '../controllers/flash';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { validateBody, flashSaleSchema } from '../utils/validation';

const router = Router();

router.get('/', listFlashSales);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'VENDOR'),
  validateBody(flashSaleSchema),
  createFlashSale
);

export default router;
