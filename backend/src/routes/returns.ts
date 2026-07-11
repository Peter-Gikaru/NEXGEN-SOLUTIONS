import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { createReturnRequest } from '../controllers/returns';

const router = Router();

router.post('/', authenticateJWT, createReturnRequest);

export default router;
