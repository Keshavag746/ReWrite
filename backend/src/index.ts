import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import rewriteRouter from './routes/rewrite';
import usageRouter from './routes/usage';
import historyRouter from './routes/history';
import { shutdownAnalytics } from './services/analyticsService';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Chrome extension origins and local dev
      if (!origin || origin.startsWith('chrome-extension://') || origin === 'http://localhost:5173') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '50kb' }));

// Global express rate limiter (IP-based, high ceiling)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/rewrite', rewriteRouter);
app.use('/api/usage', usageRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Database ─────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set in environment');

  await mongoose.connect(mongoUri);
  console.log('[DB] MongoDB connected');

  const server = app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Server] SIGTERM received, shutting down...');
    server.close(async () => {
      await mongoose.disconnect();
      await shutdownAnalytics();
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
