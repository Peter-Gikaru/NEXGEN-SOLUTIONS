import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  createBulkProducts,
  toggleProductActive,
  deleteAllProducts,
  validateBulkProducts
} from '../controllers/products';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
import { validateBody, productSchema } from '../utils/validation';

const router = Router();

router.get('/', listProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:slug', getProductBySlug);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBody(productSchema),
  createProduct
);
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
router.post(
  '/bulk',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  createBulkProducts
);
router.post(
  '/bulk/validate',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBulkProducts
);
router.delete(
  '/bulk-delete-all',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  deleteAllProducts
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  validateBody(productSchema.partial()),
  updateProduct
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  deleteProduct
);
router.put('/:id/toggle-active', authenticateJWT, authorizeRoles('ADMIN'), toggleProductActive);

export default router;
