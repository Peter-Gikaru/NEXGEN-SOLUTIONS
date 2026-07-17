import rateLimit from 'express-rate-limit';
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, 
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: {
    message: 'Too many login or registration attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many email requests from this IP, please try again after 10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
