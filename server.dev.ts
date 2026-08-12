/**
 * Local development API server.
 * Mirrors the Vercel serverless functions in api/ so you can run
 * both frontend (Vite) and backend (this file) locally.
 *
 * Run:  npx tsx server.dev.ts
 * Then: npm run dev   (in a separate terminal)
 *
 * Vite proxies /api → http://localhost:3001 (see vite.config.ts)
 */

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { AppDataModel } from './src/models/AppDataModel';
import { INITIAL_DATA } from './src/data/initialData';
import type { AppData } from './src/types';

const app = express();
const PORT = 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ── MongoDB connection ────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB connection failed:', err.message); process.exit(1); });

// ── GET /api/data ─────────────────────────────────────────────────────────────
app.get('/api/data', async (req, res) => {
  try {
    let doc = await AppDataModel.findOne({ _key: 'main' }).lean();
    if (!doc) {
      const created = await AppDataModel.create({
        _key: 'main',
        data: INITIAL_DATA,
        updatedAt: new Date(),
      });
      return res.json({ data: created.data, updatedAt: created.updatedAt });
    }
    return res.json({ data: doc.data, updatedAt: doc.updatedAt });
  } catch (err: any) {
    console.error('[GET /api/data]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/data ────────────────────────────────────────────────────────────
app.post('/api/data', async (req, res) => {
  try {
    const incoming: AppData = req.body;
    if (!incoming || !Array.isArray(incoming.persons)) {
      return res.status(400).json({ error: 'Invalid AppData payload' });
    }
    const updatedAt = new Date();
    const doc = await AppDataModel.findOneAndUpdate(
      { _key: 'main' },
      { $set: { data: incoming, updatedAt } },
      { upsert: true, returnDocument: 'after', lean: true }
    );
    return res.json({ data: doc!.data, updatedAt: doc!.updatedAt });
  } catch (err: any) {
    console.error('[POST /api/data]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/data/reset ──────────────────────────────────────────────────────
app.post('/api/data/reset', async (req, res) => {
  try {
    const updatedAt = new Date();
    const doc = await AppDataModel.findOneAndUpdate(
      { _key: 'main' },
      { $set: { data: INITIAL_DATA, updatedAt } },
      { upsert: true, returnDocument: 'after', lean: true }
    );
    return res.json({ data: doc!.data, updatedAt: doc!.updatedAt });
  } catch (err: any) {
    console.error('[POST /api/data/reset]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/data/clear ──────────────────────────────────────────────────────
app.post('/api/data/clear', async (req, res) => {
  try {
    const empty: AppData = {
      settings: { pricePerMeal: 50 },
      persons: [], billingCycles: [], mealRecords: [], paymentReceipts: [],
    };
    const updatedAt = new Date();
    const doc = await AppDataModel.findOneAndUpdate(
      { _key: 'main' },
      { $set: { data: empty, updatedAt } },
      { upsert: true, returnDocument: 'after', lean: true }
    );
    return res.json({ data: doc!.data, updatedAt: doc!.updatedAt });
  } catch (err: any) {
    console.error('[POST /api/data/clear]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server running at http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/data`);
  console.log(`   POST http://localhost:${PORT}/api/data`);
  console.log(`   POST http://localhost:${PORT}/api/data/reset`);
  console.log(`   POST http://localhost:${PORT}/api/data/clear`);
});
