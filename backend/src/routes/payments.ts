import { Router } from 'express';
import { initiateMpesaPush, mpesaCallback } from '../controllers/payments';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/mpesa-pay', authenticateJWT, initiateMpesaPush);
router.post('/retry', authenticateJWT, initiateMpesaPush);
router.post('/mpesa-callback', mpesaCallback);

export default router;
