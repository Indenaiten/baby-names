import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../infrastructure/auth/AuthService';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = AuthService.verifyToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin' && req.userRole !== 'root') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export function rootMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'root') {
    res.status(403).json({ error: 'Root access required' });
    return;
  }
  next();
}
