import { Router } from 'express';
import { getWishlist, toggleWishlist, getRecommendations } from '../controllers/wishlist';
import { optionalAuthenticateJWT } from '../middleware/auth';
import { validateSession } from '../middleware/session';

const router = Router();
router.use(validateSession);

router.get('/', optionalAuthenticateJWT, getWishlist);
router.post('/toggle', optionalAuthenticateJWT, toggleWishlist);
router.get('/recommendations', optionalAuthenticateJWT, getRecommendations);

export default router;
