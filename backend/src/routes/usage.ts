import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Usage } from '../models/Usage';

const router = Router();

// GET /api/usage
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const freeLimit = parseInt(process.env.FREE_DAILY_LIMIT || '50', 10);
    const today = new Date().toISOString().slice(0, 10);

    const usage = await Usage.findOne({ userId: user._id, date: today });
    const count = usage?.rewriteCount ?? 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    res.json({
      count,
      limit: user.plan === 'pro' ? -1 : freeLimit, // -1 = unlimited
      plan: user.plan,
      resetAt: tomorrow.toISOString(),
    });
  } catch (err) {
    console.error('[Usage] Error:', err);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export default router;
