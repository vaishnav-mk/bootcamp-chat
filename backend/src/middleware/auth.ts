import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt.js';
import { ErrorMessage } from '../constants/errors.js';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: ErrorMessage.TOKEN_REQUIRED });
    return;
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    
    next();
  } catch (error) {
    res.status(403).json({ error: ErrorMessage.INVALID_OR_EXPIRED_TOKEN });
  }
};
