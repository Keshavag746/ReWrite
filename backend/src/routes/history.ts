import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Rewrite } from '../models/Rewrite';

const router = Router();

// GET /api/history?page=1&limit=20
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(50, parseInt(req.query.limit as string || '20', 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Rewrite.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Rewrite.countDocuments({ userId: user._id }),
    ]);

    res.json({
      items: items.map((r) => ({
        id: r._id.toString(),
        originalText: r.originalText,
        rewrittenText: r.rewrittenText,
        mode: r.mode,
        modelUsed: r.modelUsed,
        createdAt: r.createdAt.toISOString(),
      })),
      page,
      total,
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    console.error('[History] Error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
