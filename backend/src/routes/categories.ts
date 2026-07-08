import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories';
const router = Router();
router.get('/', listCategories);
router.post('/', authenticateJWT, authorizeRoles('ADMIN'), createCategory);
router.put('/:id', authenticateJWT, authorizeRoles('ADMIN'), updateCategory);
router.delete('/:id', authenticateJWT, authorizeRoles('ADMIN'), deleteCategory);
export default router;
