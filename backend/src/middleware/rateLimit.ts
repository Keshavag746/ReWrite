import { Response, NextFunction } from 'express';
import { Usage } from '../models/Usage';
import { AuthRequest } from './auth';
import { usageCache } from '../utils/cache';

export async function rateLimitMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Pro users have unlimited rewrites
    if (user.plan === 'pro') {
      next();
      return;
    }

    const freeLimit = parseInt(process.env.FREE_DAILY_LIMIT || '50', 10);
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const cacheKey = `${user._id.toString()}-${today}`;

    let currentCount = usageCache.get(cacheKey);

    if (currentCount === undefined) {
      const usage = await Usage.findOne({ userId: user._id, date: today });
      currentCount = usage?.rewriteCount ?? 0;
      usageCache.set(cacheKey, currentCount);
    }

    if (currentCount >= freeLimit) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      res.status(429).json({
        error: 'Daily rewrite limit reached',
        limit: freeLimit,
        count: currentCount,
        resetAt: tomorrow.toISOString(),
        plan: user.plan,
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
