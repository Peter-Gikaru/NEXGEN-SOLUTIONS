import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import crypto from 'crypto';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import promoRoutes from './routes/promo';
import flashRoutes from './routes/flash';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/uploads';
import paymentRoutes from './routes/payments';
import wishlistRoutes from './routes/wishlist';
import trackRoutes from './routes/track';
import seoRoutes from './routes/seo';
import shippingRoutes from './routes/shipping';
import adminLogRoutes from './routes/adminLogs';
import newsletterRoutes from './routes/newsletter';
import returnRoutes from './routes/returns';
import warrantyRoutes from './routes/warranty';
import { initCronJobs } from './services/cron';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set.');
  console.error('The application will not start without a secure JWT secret.');
  console.error('Set it in backend/.env or the system environment.');
  process.exit(1);
}
if (!process.env.FRONTEND_URL) {
  console.error('FATAL: FRONTEND_URL environment variable is not set.');
  console.error('Set FRONTEND_URL to the allowed storefront origin(s), comma-separated if needed.');
  process.exit(1);
}
const app = express();
const port = process.env.PORT || 5000;
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"]
    }
  }
}));
const allowedOrigins = process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-id', 'x-csrf-token']
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const csrfMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies['XSRF-TOKEN']) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('XSRF-TOKEN', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
    return next();
  }

  
  if (req.originalUrl === '/api/payments/mpesa-callback') {
    return next();
  }

  const cookieToken = req.cookies['XSRF-TOKEN'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'CSRF token validation failed' });
  }
  next();
};
app.use(csrfMiddleware);
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  fallthrough: false,
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));
app.use('/data', express.static(path.join(__dirname, '../../data'), {
  fallthrough: false,
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin/logs', adminLogRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/warranty', warrantyRoutes);

app.use(errorHandler);
initCronJobs();
app.listen(port, () => {
  console.log(`Server running on port ${port} with JWT_SECRET configured.`);
});
