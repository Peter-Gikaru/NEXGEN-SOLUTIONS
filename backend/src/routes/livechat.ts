import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { getActiveVisitors, getVisitorMessages } from '../controllers/livechat';

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN', 'SUPERADMIN'));
router.get('/visitors', getActiveVisitors);
router.get('/visitors/:visitorId/messages', getVisitorMessages);

export default router;
