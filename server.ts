import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_INITIAL_DATA = {
  settings: {
    pricePerMeal: 50,
  },
  persons: [
    {
      id: 'p-irfan',
      name: 'Irfan',
      createdAt: new Date().toISOString().split('T')[0],
      activeCycleId: 'cycle-irfan-1',
    },
    {
      id: 'p-vishnu',
      name: 'Vishnu',
      createdAt: new Date().toISOString().split('T')[0],
      activeCycleId: 'cycle-vishnu-1',
    },
    {
      id: 'p-abhi',
      name: 'Abhi',
      createdAt: new Date().toISOString().split('T')[0],
      activeCycleId: 'cycle-abhi-1',
    },
  ],
  billingCycles: [
    {
      id: 'cycle-irfan-1',
      personId: 'p-irfan',
      cycleNumber: 1,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
    {
      id: 'cycle-vishnu-1',
      personId: 'p-vishnu',
      cycleNumber: 1,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
    {
      id: 'cycle-abhi-1',
      personId: 'p-abhi',
      cycleNumber: 1,
      startDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    },
  ],
  mealRecords: [],
  paymentReceipts: [],
};

// Helper to read DB
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_INITIAL_DATA, null, 2));
    return DEFAULT_INITIAL_DATA;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_DATA;
  }
}

// Helper to write DB
function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get('/api/data', (_req, res) => {
  const data = readDb();
  res.json(data);
});

app.post('/api/data', (req, res) => {
  const newAppData = req.body;
  if (!newAppData || !Array.isArray(newAppData.persons)) {
    res.status(400).json({ error: 'Invalid app data format' });
    return;
  }
  writeDb(newAppData);
  res.json({ success: true, data: newAppData });
});

app.post('/api/data/reset-sample', (_req, res) => {
  writeDb(DEFAULT_INITIAL_DATA);
  res.json(DEFAULT_INITIAL_DATA);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Meal & Payment Tracker server running on http://localhost:${PORT}`);
  });
}

startServer();
