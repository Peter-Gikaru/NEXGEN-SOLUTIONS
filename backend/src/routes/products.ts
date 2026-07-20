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
  validateBulkProducts,
  getFilterMetadata
} from '../controllers/products';
import { authenticateJWT, authorizeRoles, optionalAuthenticateJWT } from '../middleware/auth';
import { validateBody, productSchema } from '../utils/validation';

const router = Router();

router.get('/', optionalAuthenticateJWT, listProducts);
router.get('/meta/filters', optionalAuthenticateJWT, getFilterMetadata);
router.get('/:id/related', optionalAuthenticateJWT, getRelatedProducts);
router.get('/:slug', optionalAuthenticateJWT, getProductBySlug);
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
