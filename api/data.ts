import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../src/lib/mongodb';
import { AppDataModel } from '../src/models/AppDataModel';
import { AppData } from '../src/types';
import { INITIAL_DATA } from '../src/data/initialData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow cross-origin requests (needed during local dev with Vite proxy)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectToDatabase();

    // ── GET /api/data ─────────────────────────────────────────────────────────
    // Returns the current AppData. If no document exists yet, seeds with INITIAL_DATA.
    if (req.method === 'GET') {
      let doc = await AppDataModel.findOne({ _key: 'main' }).lean();

      if (!doc) {
        // First time: seed the database with sample data
        const created = await AppDataModel.create({
          _key: 'main',
          data: INITIAL_DATA,
          updatedAt: new Date(),
        });
        return res.status(200).json({ data: created.data, updatedAt: created.updatedAt });
      }

      return res.status(200).json({ data: doc.data, updatedAt: doc.updatedAt });
    }

    // ── POST /api/data ────────────────────────────────────────────────────────
    // Saves the full AppData sent in the request body.
    if (req.method === 'POST') {
      const incoming: AppData = req.body;

      if (!incoming || !Array.isArray(incoming.persons)) {
        return res.status(400).json({ error: 'Invalid AppData payload' });
      }

      const updatedAt = new Date();

      const doc = await AppDataModel.findOneAndUpdate(
        { _key: 'main' },
        { $set: { data: incoming, updatedAt } },
        { upsert: true, new: true, lean: true }
      );

      return res.status(200).json({ data: doc!.data, updatedAt: doc!.updatedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/data] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
