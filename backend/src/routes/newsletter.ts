import express from 'express';
import { subscribe, sendPromotion } from '../controllers/newsletter';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.post('/subscribe', subscribe);
router.post('/send-promotion', authenticateJWT, authorizeRoles('ADMIN'), sendPromotion);

export default router;
