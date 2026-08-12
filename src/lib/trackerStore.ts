import { AppData, Person } from '../types';
import { INITIAL_DATA, getTodayStr } from '../data/initialData';

// ── API base URL ──────────────────────────────────────────────────────────────
// In production (Vercel) the API routes live on the same origin.
// In local dev the Vite proxy forwards /api → the Vercel dev server (port 3001).
const API_BASE = '/api';

// ── Polling interval (ms) ─────────────────────────────────────────────────────
// Every 5 seconds we fetch fresh data from MongoDB so all open tabs/devices
// stay in sync.
export const POLL_INTERVAL_MS = 5000;

// ── Slot helpers (unchanged) ──────────────────────────────────────────────────

export function getSlotUnlockTime(slot: 'morning' | 'afternoon' | 'night'): string {
  switch (slot) {
    case 'morning':   return '9:00 AM';
    case 'afternoon': return '2:00 PM';
    case 'night':     return '8:00 PM';
  }
}

export function isSlotLocked(slot: 'morning' | 'afternoon' | 'night', dateStr: string): boolean {
  const today = getTodayStr();
  if (dateStr !== today) return false; // past dates always unlocked

  const hour = new Date().getHours();
  switch (slot) {
    case 'morning':   return hour < 9;
    case 'afternoon': return hour < 14;
    case 'night':     return hour < 20;
    default:          return false;
  }
}

// ── Balance / today helpers (pure, unchanged) ─────────────────────────────────

export function calculatePersonBalance(person: Person, data: AppData) {
  const activeCycle = data.billingCycles.find(c => c.id === person.activeCycleId);
  if (!activeCycle) {
    return { unpaidMeals: 0, amountDue: 0, cycleNumber: 1, startDate: person.createdAt };
  }

  const activeRecords = data.mealRecords.filter(
    r => r.personId === person.id && r.cycleId === activeCycle.id
  );

  return {
    unpaidMeals:  activeRecords.reduce((s, r) => s + r.totalMeals, 0),
    amountDue:    activeRecords.reduce((s, r) => s + r.totalCost,  0),
    cycleNumber:  activeCycle.cycleNumber,
    startDate:    activeCycle.startDate,
  };
}

export function calculateTodayMealForPerson(personId: string, data: AppData) {
  const today = getTodayStr();
  const rec = data.mealRecords.find(r => r.personId === personId && r.date === today);
  if (!rec) return { morning: 0, afternoon: 0, night: 0, totalMeals: 0, totalCost: 0 };
  return {
    morning:    rec.meals.morning    || 0,
    afternoon:  rec.meals.afternoon  || 0,
    night:      rec.meals.night      || 0,
    totalMeals: rec.totalMeals       || 0,
    totalCost:  rec.totalCost        || 0,
  };
}

// ── Remote data helpers ───────────────────────────────────────────────────────

/**
 * Fetch the latest AppData from MongoDB via the API.
 * Returns null on failure so callers can distinguish a real response
 * from a network error — this prevents the polling loop from overwriting
 * the UI with stale fallback data when the API is temporarily unreachable.
 */
export async function fetchAppData(): Promise<AppData | null> {
  try {
    const res = await fetch(`${API_BASE}/data`);
    if (!res.ok) throw new Error(`GET /api/data returned ${res.status}`);
    const json = await res.json();
    return json.data as AppData;
  } catch (err) {
    console.warn('[trackerStore] fetchAppData failed:', err);
    return null;
  }
}

/**
 * Persist the full AppData to MongoDB.
 * Returns true on success.
 */
export async function saveAppData(data: AppData): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/data`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST /api/data returned ${res.status}`);
    return true;
  } catch (err) {
    console.error('[trackerStore] saveAppData failed:', err);
    return false;
  }
}

/**
 * Reset to sample data in MongoDB and return the reset AppData.
 */
export async function resetAppDataToServer(): Promise<AppData> {
  try {
    const res = await fetch(`${API_BASE}/data/reset`, { method: 'POST' });
    if (!res.ok) throw new Error(`POST /api/data/reset returned ${res.status}`);
    const json = await res.json();
    return json.data as AppData;
  } catch (err) {
    console.error('[trackerStore] resetAppDataToServer failed:', err);
    return INITIAL_DATA;
  }
}

/**
 * Clear all data in MongoDB and return an empty AppData.
 */
export async function clearAppDataToEmpty(): Promise<AppData> {
  const empty: AppData = {
    settings: { pricePerMeal: 50 },
    persons: [],
    billingCycles: [],
    mealRecords: [],
    paymentReceipts: [],
  };
  try {
    const res = await fetch(`${API_BASE}/data/clear`, { method: 'POST' });
    if (!res.ok) throw new Error(`POST /api/data/clear returned ${res.status}`);
    const json = await res.json();
    return json.data as AppData;
  } catch (err) {
    console.error('[trackerStore] clearAppDataToEmpty failed:', err);
    return empty;
  }
}
