import { Router } from 'express';
import { trackOrder, recoverTracking } from '../controllers/track';

const router = Router();

router.get('/', trackOrder);
router.post('/recover', recoverTracking);

export default router;
