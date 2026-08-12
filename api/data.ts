import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../src/lib/mongodb';
import { AppDataModel } from '../src/models/AppDataModel';
import type { AppData } from '../src/types';
import { INITIAL_DATA } from '../src/data/initialData';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      let doc = await AppDataModel.findOne({ _key: 'main' }).lean();
      if (!doc) {
        const created = await AppDataModel.create({
          _key: 'main',
          data: INITIAL_DATA,
          updatedAt: new Date(),
        });
        return res.status(200).json({ data: created.data, updatedAt: created.updatedAt });
      }
      return res.status(200).json({ data: doc.data, updatedAt: doc.updatedAt });
    }

    if (req.method === 'POST') {
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
      return res.status(200).json({ data: doc!.data, updatedAt: doc!.updatedAt });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[api/data] error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
