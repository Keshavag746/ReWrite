import { Response, NextFunction } from 'express';
import { Usage } from '../models/Usage';
import { AuthRequest } from './auth';
import { usageCache } from '../utils/cache';

async function getUsageForLastNDays(userId: string, days: number): Promise<number> {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  const startDateStr = d.toISOString().slice(0, 10);
  
  const usages = await Usage.find({
    userId,
    date: { $gte: startDateStr }
  });
  return usages.reduce((sum, u) => sum + u.rewriteCount, 0);
}

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

    const plan = user.plan || 'free';

    // Pro users have unlimited rewrites
    if (plan === 'pro') {
      next();
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    let limit = 5;
    let count = 0;

    if (plan === 'free') {
      limit = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10);
      const cacheKey = `${user._id.toString()}-${today}`;
      let currentCount = usageCache.get(cacheKey);

      if (currentCount === undefined) {
        const usage = await Usage.findOne({ userId: user._id, date: today });
        currentCount = usage?.rewriteCount ?? 0;
        usageCache.set(cacheKey, currentCount);
      }
      count = currentCount;
    } else if (plan === 'weekly') {
      limit = 140;
      count = await getUsageForLastNDays(user._id.toString(), 7);
    } else if (plan === 'monthly') {
      limit = 600;
      count = await getUsageForLastNDays(user._id.toString(), 30);
    } else if (plan === 'yearly') {
      limit = 9000;
      count = await getUsageForLastNDays(user._id.toString(), 365);
    }

    if (count >= limit) {
      res.status(429).json({
        error: `${plan.charAt(0).toUpperCase() + plan.slice(1)} rewrite limit reached (${count}/${limit})`,
        limit,
        count,
        resetAt: tomorrow.toISOString(),
        plan,
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}

