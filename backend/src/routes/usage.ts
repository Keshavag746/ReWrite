import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Usage } from '../models/Usage';

const router = Router();

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

// GET /api/usage
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const plan = user.plan || 'free';
    const today = new Date().toISOString().slice(0, 10);

    let count = 0;
    let limit = 5;

    if (plan === 'free') {
      limit = parseInt(process.env.FREE_DAILY_LIMIT || '5', 10);
      const usage = await Usage.findOne({ userId: user._id, date: today });
      count = usage?.rewriteCount ?? 0;
    } else if (plan === 'weekly') {
      limit = 140;
      count = await getUsageForLastNDays(user._id.toString(), 7);
    } else if (plan === 'monthly') {
      limit = 600;
      count = await getUsageForLastNDays(user._id.toString(), 30);
    } else if (plan === 'yearly') {
      limit = 9000;
      count = await getUsageForLastNDays(user._id.toString(), 365);
    } else if (plan === 'pro') {
      limit = -1;
      const usage = await Usage.findOne({ userId: user._id, date: today });
      count = usage?.rewriteCount ?? 0;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    res.json({
      count,
      limit,
      plan,
      resetAt: tomorrow.toISOString(),
    });
  } catch (err) {
    console.error('[Usage] Error:', err);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export default router;
