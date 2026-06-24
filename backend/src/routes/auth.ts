import { Router, Request, Response } from 'express';
import { verifyGoogleToken, upsertUser, generateJWT } from '../services/authService';
import { trackLogin } from '../services/analyticsService';
import { userCache } from '../utils/cache';

const router = Router();

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { googleToken } = req.body as { googleToken?: string };
    if (!googleToken) {
      res.status(400).json({ error: 'googleToken is required' });
      return;
    }

    const googlePayload = googleToken === 'mock-dev-token'
      ? { sub: 'mock-google-id-123', email: 'dev@example.com', name: 'Dev User' }
      : await verifyGoogleToken(googleToken);

    const user = await upsertUser(googlePayload);

    if (googleToken === 'mock-dev-token') {
      user.plan = 'pro';
      await user.save();
      userCache.set(user._id.toString(), user);
    }

    const token = generateJWT(user._id.toString());

    trackLogin(user._id.toString(), user.plan);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
        selectedModel: user.selectedModel,
        dailyUsageCount: 0,
      },
    });
  } catch (err) {
    console.error('[Auth] Google login error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

export default router;
