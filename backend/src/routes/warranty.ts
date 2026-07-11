import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { createWarrantyClaim } from '../controllers/warranty';

const router = Router();

router.post('/', authenticateJWT, createWarrantyClaim);

export default router;
