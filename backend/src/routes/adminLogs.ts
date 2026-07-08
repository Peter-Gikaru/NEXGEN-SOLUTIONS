import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { getAdminLogs } from '../controllers/adminLogs';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles('ADMIN'), getAdminLogs);

export default router;
