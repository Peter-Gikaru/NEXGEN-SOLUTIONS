import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  saveGuestEmail,
} from '../controllers/cart';
import { optionalAuthenticateJWT } from '../middleware/auth';
import { validateSession } from '../middleware/session';

const router = Router();

router.use(optionalAuthenticateJWT);
router.use(validateSession);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/guest-email', saveGuestEmail);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
