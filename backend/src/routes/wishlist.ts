import { Router } from 'express';
import { getWishlist, toggleWishlist, getRecommendations } from '../controllers/wishlist';
import { optionalAuthenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticateJWT, getWishlist);
router.post('/toggle', optionalAuthenticateJWT, toggleWishlist);
router.get('/recommendations', optionalAuthenticateJWT, getRecommendations);

export default router;
