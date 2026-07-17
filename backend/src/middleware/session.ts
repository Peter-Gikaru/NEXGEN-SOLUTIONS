import { Request, Response, NextFunction } from 'express';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string;

  if (sessionId) {
    if (!UUID_REGEX.test(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID format. Must be a valid UUID.' });
    }
  }

  next();
};
