import { Router } from 'express';
import { register, login, logout, getProfile, updateAddress, deactivateAccount, restoreAccount, googleLogin, forgotPassword, resetPassword, forceChangePassword, facebookLogin, passkeyRegisterStart, passkeyRegisterFinish, passkeyLoginStart, passkeyLoginFinish } from '../controllers/auth';
import { authenticateJWT } from '../middleware/auth';
import { validateBody, registerSchema, loginSchema } from '../utils/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile/address', authenticateJWT, updateAddress);
router.delete('/deactivate', authenticateJWT, deactivateAccount);
router.post('/restore', authLimiter, restoreAccount);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/force-change-password', authenticateJWT, forceChangePassword);

// WebAuthn Routes
router.post('/passkey/register/start', authenticateJWT, passkeyRegisterStart);
router.post('/passkey/register/finish', authenticateJWT, passkeyRegisterFinish);
router.post('/passkey/login/start', authLimiter, passkeyLoginStart);
router.post('/passkey/login/finish', authLimiter, passkeyLoginFinish);

export default router;
