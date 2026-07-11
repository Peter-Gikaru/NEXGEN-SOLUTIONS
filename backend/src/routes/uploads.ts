import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';
const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'model/gltf-binary', 
    'model/gltf+json', 
    'application/octet-stream' 
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.glb') || file.originalname.endsWith('.gltf')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GLB, and GLTF are allowed.'));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
});
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'VENDOR'),
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('files', 30)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        if (req.file) {
          const fileUrl = `/uploads/${req.file.filename}`;
          return res.status(201).json({ url: fileUrl });
        }
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const urls = files.map((file) => `/uploads/${file.filename}`);
      return res.status(201).json({ urls });
    });
  }
);
router.post(
  '/returns',
  authenticateJWT,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }
      const urls = files.map((file) => `/uploads/${file.filename}`);
      return res.status(201).json({ urls });
    });
  }
);
export default router;
