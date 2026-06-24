import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { userCache } from '../utils/cache';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, secret) as { userId: string };
    
    let user = userCache.get(decoded.userId);
    if (!user) {
      const dbUser = await User.findById(decoded.userId);
      if (!dbUser) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      user = dbUser;
      userCache.set(decoded.userId, user);
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
