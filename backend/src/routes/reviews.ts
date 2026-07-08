import { Router } from 'express';
import { createReview, listProductReviews, checkCanReview } from '../controllers/reviews';
import { authenticateJWT } from '../middleware/auth';
import { validateBody, reviewSchema } from '../utils/validation';

const router = Router();

router.post(
  '/',
  authenticateJWT,
  validateBody(reviewSchema),
  createReview
);
router.get('/product/:productId', listProductReviews);
router.get('/can-review/:productId', authenticateJWT, checkCanReview);

export default router;
