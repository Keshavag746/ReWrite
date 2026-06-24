import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { rewriteWithAI } from '../services/aiService';
import { trackRewrite } from '../services/analyticsService';
import { Rewrite } from '../models/Rewrite';
import { Usage } from '../models/Usage';
import { usageCache } from '../utils/cache';

type RewriteMode = 'improve' | 'grammar' | 'professional' | 'friendly' | 'formal' | 'casual' | 'persuasive' | 'confident' | 'shorten' | 'expand' | 'simplify' | 'humanize' | 'custom';

const router = Router();

// POST /api/rewrite
router.post(
  '/',
  authMiddleware,
  rateLimitMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { text, mode, customPrompt } = req.body as {
        text?: string;
        mode?: RewriteMode;
        customPrompt?: string;
      };

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: 'text is required' });
        return;
      }
      if (!mode) {
        res.status(400).json({ error: 'mode is required' });
        return;
      }

      const user = req.user!;

      const result = await rewriteWithAI(text, mode, undefined, customPrompt);

      // Save rewrite to history
      await Rewrite.create({
        userId: user._id,
        originalText: text.slice(0, 5000),
        rewrittenText: result.output,
        mode,
        modelUsed: result.modelUsed,
      });

      // Increment daily usage counter
      const today = new Date().toISOString().slice(0, 10);
      await Usage.findOneAndUpdate(
        { userId: user._id, date: today },
        { $inc: { rewriteCount: 1 } },
        { upsert: true }
      );
      
      // Update cache
      const cacheKey = `${user._id.toString()}-${today}`;
      const currentCacheVal = usageCache.get(cacheKey);
      if (currentCacheVal !== undefined) {
        usageCache.set(cacheKey, currentCacheVal + 1);
      }

      // Track event
      trackRewrite({
        userId: user._id.toString(),
        mode,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed,
        plan: user.plan,
      });

      res.json({
        output: result.output,
        modelUsed: result.modelUsed,
        tokensUsed: result.tokensUsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rewrite failed';
      console.error('[Rewrite] Error:', err);
      res.status(500).json({ error: message });
    }
  }
);

export default router;
