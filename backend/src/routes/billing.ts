import { Router, Response, Request } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';

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

// Helper to determine plan from payment details
function determinePlanAndDuration(amount: number, description: string = ''): { plan: 'weekly' | 'monthly' | 'yearly'; durationDays: number } {
  const descLower = description.toLowerCase();
  
  // Weekly: approx 3.99 USD or 149 INR
  if (descLower.includes('weekly') || amount === 149 || amount === 14900 || amount === 3.99) {
    return { plan: 'weekly', durationDays: 7 };
  }
  // Yearly: approx 79.99 USD or 2999 INR
  if (descLower.includes('yearly') || amount === 2999 || amount === 299900 || amount === 79.99) {
    return { plan: 'yearly', durationDays: 365 };
  }
  // Monthly (default pro tier fallback): 9.99 USD or 399 INR
  return { plan: 'monthly', durationDays: 30 };
}

// POST /api/billing/webhook/razorpay
router.post('/webhook/razorpay', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');
      if (digest !== signature) {
        console.warn('[Webhook] Razorpay signature verification failed');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const event = req.body.event;
    console.log(`[Webhook] Razorpay Event received: ${event}`);

    // We process payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = req.body.payload.payment.entity;
      const email = payment.email;
      const amount = payment.amount / 100; // Razorpay sends in paise
      const description = payment.description || '';

      if (!email) {
        console.warn('[Webhook] Razorpay payment entity missing email');
        return res.json({ status: 'ignored', reason: 'no email' });
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.warn(`[Webhook] Razorpay: No user found with email ${email}`);
        return res.json({ status: 'ignored', reason: 'user not found' });
      }

      const { plan, durationDays } = determinePlanAndDuration(amount, description);
      
      // Update User Plan
      user.plan = plan;
      await user.save();

      // Create/Update Subscription
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + durationDays);

      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          plan: 'pro',
          status: 'active',
          renewalDate
        },
        { upsert: true, new: true }
      );

      console.log(`[Webhook] Razorpay checkout successful. Upgraded user ${email} to ${plan} plan.`);
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error('[Webhook] Razorpay error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/billing/webhook/paypal
router.post('/webhook/paypal', async (req: Request, res: Response) => {
  try {
    const eventType = req.body.event_type;
    console.log(`[Webhook] PayPal Event received: ${eventType}`);

    // Process payment completed event
    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const sale = req.body.resource;
      const email = sale.payer?.email_address || sale.payer_info?.email;
      const amount = parseFloat(sale.amount?.total || '0');
      const customId = sale.custom_id || sale.custom || '';

      // Find user by custom_id (e.g. user ID) or by email
      let user = null;
      if (customId && mongoose.isValidObjectId(customId)) {
        user = await User.findById(customId);
      }
      if (!user && email) {
        user = await User.findOne({ email: email.toLowerCase() });
      }

      if (!user) {
        console.warn(`[Webhook] PayPal: No user found for payment email: ${email}, customId: ${customId}`);
        return res.json({ status: 'ignored', reason: 'user not found' });
      }

      const { plan, durationDays } = determinePlanAndDuration(amount, customId);
      
      // Update User Plan
      user.plan = plan;
      await user.save();

      // Create/Update Subscription
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + durationDays);

      await Subscription.findOneAndUpdate(
        { userId: user._id },
        {
          plan: 'pro',
          status: 'active',
          renewalDate
        },
        { upsert: true, new: true }
      );

      console.log(`[Webhook] PayPal checkout successful. Upgraded user ${user.email} to ${plan} plan.`);
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error('[Webhook] PayPal error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
