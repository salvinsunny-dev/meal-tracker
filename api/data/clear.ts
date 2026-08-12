import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../../src/lib/mongodb';
import { AppDataModel } from '../../src/models/AppDataModel';
import { AppData } from '../../src/types';

const EMPTY_DATA: AppData = {
  settings: { pricePerMeal: 50 },
  persons: [],
  billingCycles: [],
  mealRecords: [],
  paymentReceipts: [],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectToDatabase();

    const updatedAt = new Date();
    const doc = await AppDataModel.findOneAndUpdate(
      { _key: 'main' },
      { $set: { data: EMPTY_DATA, updatedAt } },
      { upsert: true, new: true, lean: true }
    );

    return res.status(200).json({ data: doc!.data, updatedAt: doc!.updatedAt });
  } catch (err) {
    console.error('[api/data/clear] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
