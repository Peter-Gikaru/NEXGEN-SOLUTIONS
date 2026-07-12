import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendWelcomeEmail, sendPasswordChangedAlertEmail } from '../services/emailService';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { logAction } from '../services/audit';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (user: { id: string; email: string; role: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured. Server cannot generate tokens.');
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '24h' }
  );
};
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const assignedRole = 'USER';
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: assignedRole,
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    sendWelcomeEmail(email, name).catch(console.error);
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    await logAction('REGISTER_SUCCESS', `User registered: ${email}`, 'INFO', user.id, undefined, req.ip, req.headers['user-agent']);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      logger.warn(`SECURITY ALERT: Failed login attempt for non-existent email: ${email} from IP: ${req.ip}`);
      await logAction('LOGIN_FAILED', `Failed login for non-existent email: ${email}`, 'WARNING', undefined, undefined, req.ip, req.headers['user-agent']);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.status === 'SUSPENDED') {
      logger.warn(`SECURITY ALERT: Attempted login to SUSPENDED account: ${email} from IP: ${req.ip}`);
      return res.status(403).json({ message: 'Your account has been suspended' });
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      logger.warn(`SECURITY ALERT: Attempted login to LOCKED account: ${email} from IP: ${req.ip}`);
      return res.status(403).json({ message: 'Too many incorrect attempts. Your account has been temporarily locked for 15 minutes.' });
    }
    if (user.deletedAt) {
      const msIn7Days = 7 * 24 * 60 * 60 * 1000;
      if (new Date().getTime() - user.deletedAt.getTime() < msIn7Days) {
        return res.status(403).json({ message: 'ACCOUNT_DELETED_GRACE_PERIOD' });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
    if (!user.passwordHash) {
      return res.status(401).json({ message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const newAttempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: newAttempts };
      if (newAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        logger.warn(`SECURITY ALERT: Account LOCKED due to brute force: ${email} from IP: ${req.ip}`);
        await logAction('LOGIN_FAILED', `Account LOCKED due to brute force: ${email}`, 'CRITICAL', user.id, undefined, req.ip, req.headers['user-agent']);
      } else {
        logger.warn(`SECURITY ALERT: Failed login attempt (wrong password) for email: ${email} from IP: ${req.ip}`);
        await logAction('LOGIN_FAILED', `Invalid password for: ${email}`, 'WARNING', user.id, undefined, req.ip, req.headers['user-agent']);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: updates
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null }
      });
    }
    logger.info(`User logged in successfully: ${user.email} (Role: ${user.role})`);
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    await logAction('LOGIN_SUCCESS', `User logged in: ${user.email}`, 'INFO', user.id, undefined, req.ip, req.headers['user-agent']);
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
      defaultAddress: user.defaultAddress ? JSON.parse(user.defaultAddress) : null,
    });
  } catch (error) {
    return next(error);
  }
};
export const deactivateAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    await prisma.user.update({
      where: { id: req.user.id },
      data: { deletedAt: new Date() }
    });
    res.clearCookie('token');
    return res.json({ message: 'Account scheduled for deletion' });
  } catch (error) {
    return next(error);
  }
};
export const restoreAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.passwordHash) return res.status(400).json({ message: 'User relies on third-party login' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });
    if (!user.deletedAt) {
      return res.status(400).json({ message: 'Account is not scheduled for deletion' });
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: null, failedLoginAttempts: 0, lockedUntil: null }
    });
    const token = generateToken(updatedUser);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      message: 'Account restored successfully'
    });
  } catch (error) {
    return next(error);
  }
};
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  await logAction('LOGOUT', `User logged out`, 'INFO', undefined, undefined, req.ip, req.headers['user-agent']);
  return res.json({ message: 'Logged out successfully' });
};
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        defaultAddress: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
      ...user,
      defaultAddress: user.defaultAddress ? JSON.parse(user.defaultAddress) : null,
    });
  } catch (error) {
    return next(error);
  }
};
export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { address } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { defaultAddress: JSON.stringify(address) }
    });
    await logAction('UPDATE_ADDRESS', 'User updated their default shipping address', 'INFO', req.user.id, undefined, req.ip, req.headers['user-agent']);
    return res.json({ message: 'Address updated successfully' });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        requiresPasswordChange: true,
        defaultAddress: true,
      }
    });
    await logAction('UPDATE_PROFILE', 'User updated their profile details', 'INFO', req.user.id, undefined, req.ip, req.headers['user-agent']);
    return res.json({
      ...user,
      defaultAddress: user.defaultAddress ? JSON.parse(user.defaultAddress) : null,
    });
  } catch (error) {
    return next(error);
  }
};
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing' });
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }
    const { email, name, sub: googleId } = payload;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          googleId,
          role: 'USER',
          cart: { create: {} },
        },
      });
      sendWelcomeEmail(email, name || 'Google User').catch(console.error);
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
      defaultAddress: user.defaultAddress ? JSON.parse(user.defaultAddress) : null,
    });
  } catch (error) {
    return next(error);
  }
};
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), 
      }
    });
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return res.status(500).json({ message: 'FRONTEND_URL is not configured' });
    }
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
    return res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    return next(error);
  }
};
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        requiresPasswordChange: false,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    sendPasswordChangedAlertEmail(user.email).catch(console.error);
    return res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    return next(error);
  }
};
export const forceChangePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Invalid operation' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        requiresPasswordChange: false
      }
    });
    sendPasswordChangedAlertEmail(user.email).catch(console.error);
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
};

export const facebookLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Facebook token missing' });
    }
    
    const fbRes = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
    if (fbRes.status !== 200) {
      return res.status(401).json({ message: 'Invalid Facebook token' });
    }
    
    const { id: facebookId, name, email } = fbRes.data;
    
    const userEmail = email || `${facebookId}@facebook.local`;
    
    let user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: name || 'Facebook User',
          facebookId,
          role: 'USER',
          cart: { create: {} },
        },
      });
      sendWelcomeEmail(userEmail, name || 'Facebook User').catch(console.error);
    } else if (!user.facebookId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { facebookId },
      });
    }
    
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }
    
    const token = generateToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
      defaultAddress: user.defaultAddress ? JSON.parse(user.defaultAddress) : null,
    });
  } catch (error) {
    return next(error);
  }
};

const getRPInfo = (req: Request) => {
  const rpOrigin = req.headers.origin || process.env.FRONTEND_URL;
  if (!rpOrigin) {
    throw new Error('FRONTEND_URL is not configured');
  }
  const rpId = new URL(rpOrigin).hostname;
  return { rpId, rpOrigin };
};

export const passkeyRegisterStart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { webAuthnCredentials: true }
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { rpId, rpOrigin } = getRPInfo(req);
    
    const options = await generateRegistrationOptions({
      rpName: 'Laptop E-Commerce',
      rpID: rpId,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.webAuthnCredentials.map(c => ({
        id: c.credentialId,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });
    
    await prisma.webAuthnChallenge.create({
      data: {
        challenge: options.challenge,
        userId: user.id
      }
    });
    
    return res.json(options);
  } catch (error) {
    return next(error);
  }
};

export const passkeyRegisterFinish = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const body = req.body;
    const challengeObj = await prisma.webAuthnChallenge.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!challengeObj) {
      return res.status(400).json({ message: 'Challenge not found' });
    }
    
    const { rpId, rpOrigin } = getRPInfo(req);
    
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeObj.challenge,
      expectedOrigin: rpOrigin,
      expectedRPID: rpId,
    });
    
    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      
      await prisma.webAuthnCredential.create({
        data: {
          userId: req.user.id,
          credentialId: credential.id,
          publicKey: Buffer.from(credential.publicKey).toString('base64url'),
          signCount: credential.counter
        }
      });
      
      await prisma.webAuthnChallenge.delete({ where: { id: challengeObj.id } });
      
      return res.json({ verified: true });
    }
    
    return res.status(400).json({ message: 'Verification failed' });
  } catch (error) {
    return next(error);
  }
};

export const passkeyLoginStart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rpId } = getRPInfo(req);
    
    const options = await generateAuthenticationOptions({
      rpID: rpId,
      userVerification: 'preferred',
    });
    
    const sessionId = req.headers['x-session-id'] as string;
    await prisma.webAuthnChallenge.create({
      data: {
        challenge: options.challenge,
        sessionId: sessionId || null
      }
    });
    
    return res.json(options);
  } catch (error) {
    return next(error);
  }
};

export const passkeyLoginFinish = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    
    const sessionId = req.headers['x-session-id'] as string;
    const challengeObj = await prisma.webAuthnChallenge.findFirst({
      where: { sessionId: sessionId || null },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!challengeObj) {
      return res.status(400).json({ message: 'Challenge not found' });
    }
    
    const credentialIdStr = body.id;
    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId: credentialIdStr },
      include: { user: true }
    });
    
    if (!credential || !credential.user) {
      return res.status(400).json({ message: 'Credential not found' });
    }
    
    const { rpId, rpOrigin } = getRPInfo(req);
    
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengeObj.challenge,
      expectedOrigin: rpOrigin,
      expectedRPID: rpId,
      credential: {
        id: credential.credentialId,
        publicKey: new Uint8Array(Buffer.from(credential.publicKey, 'base64url')),
        counter: credential.signCount,
        transports: [],
      }
    });
    
    if (verification.verified && verification.authenticationInfo) {
      await prisma.webAuthnCredential.update({
        where: { id: credential.id },
        data: { signCount: verification.authenticationInfo.newCounter }
      });
      
      await prisma.webAuthnChallenge.delete({ where: { id: challengeObj.id } });
      
      if (credential.user.status === 'SUSPENDED') {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }
      
      const token = generateToken(credential.user);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      
      return res.json({
        id: credential.user.id,
        email: credential.user.email,
        name: credential.user.name,
        role: credential.user.role,
        requiresPasswordChange: credential.user.requiresPasswordChange,
        defaultAddress: credential.user.defaultAddress ? JSON.parse(credential.user.defaultAddress) : null,
      });
    }
    
    return res.status(400).json({ message: 'Verification failed' });
  } catch (error) {
    return next(error);
  }
};

export const checkPasskey = async (req: Request, res: Response, next: NextFunction) => { try { const email = req.query.email as string; if (!email) return res.status(400).json({ message: 'Email required' }); const user = await prisma.user.findUnique({ where: { email }, include: { webAuthnCredentials: true } }); if (!user || user.webAuthnCredentials.length === 0) { return res.json({ hasPasskey: false }); } return res.json({ hasPasskey: true }); } catch (error) { return next(error); } };

