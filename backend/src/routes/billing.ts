import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/billing/payment-links
router.get('/payment-links', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      INR: {
        weekly: process.env.RZP_WEEKLY_LINK_INR || 'https://rzp.io/rzp/si5BDcU',
        monthly: process.env.RZP_MONTHLY_LINK_INR || 'https://rzp.io/rzp/C52K7XQ',
        yearly: process.env.RZP_YEARLY_LINK_INR || 'https://rzp.io/rzp/r2MqQg4I',
      }
    });
  } catch (err) {
    console.error('[Billing] Error fetching payment links:', err);
    res.status(500).json({ error: 'Failed to fetch payment links' });
  }
});

export default router;
