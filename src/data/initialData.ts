import { AppData } from '../types';

export const getTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_DATA: AppData = {
  settings: {
    pricePerMeal: 50,
  },
  persons: [
    {
      id: 'p-irfan',
      name: 'Irfan',
      createdAt: getOffsetDateStr(-10),
      activeCycleId: 'cycle-irfan-1',
    },
    {
      id: 'p-vishnu',
      name: 'Vishnu',
      createdAt: getOffsetDateStr(-10),
      activeCycleId: 'cycle-vishnu-1',
    },
    {
      id: 'p-abhi',
      name: 'Abhi',
      createdAt: getOffsetDateStr(-10),
      activeCycleId: 'cycle-abhi-1',
    },
  ],
  billingCycles: [
    {
      id: 'cycle-irfan-1',
      personId: 'p-irfan',
      cycleNumber: 1,
      startDate: getOffsetDateStr(-10),
      status: 'ACTIVE',
    },
    {
      id: 'cycle-vishnu-1',
      personId: 'p-vishnu',
      cycleNumber: 1,
      startDate: getOffsetDateStr(-10),
      status: 'ACTIVE',
    },
    {
      id: 'cycle-abhi-1',
      personId: 'p-abhi',
      cycleNumber: 1,
      startDate: getOffsetDateStr(-10),
      status: 'ACTIVE',
    },
  ],
  mealRecords: [
    // Irfan records
    {
      id: 'mr-irfan-1',
      personId: 'p-irfan',
      cycleId: 'cycle-irfan-1',
      date: getOffsetDateStr(-3),
      meals: { morning: 1, afternoon: 1, night: 1 },
      pricePerMeal: 50,
      totalMeals: 3,
      totalCost: 150,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'mr-irfan-2',
      personId: 'p-irfan',
      cycleId: 'cycle-irfan-1',
      date: getOffsetDateStr(-2),
      meals: { morning: 1, afternoon: 0, night: 1 },
      pricePerMeal: 50,
      totalMeals: 2,
      totalCost: 100,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'mr-irfan-3',
      personId: 'p-irfan',
      cycleId: 'cycle-irfan-1',
      date: getOffsetDateStr(-1),
      meals: { morning: 1, afternoon: 1, night: 1 },
      pricePerMeal: 50,
      totalMeals: 3,
      totalCost: 150,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    // Vishnu records
    {
      id: 'mr-vishnu-1',
      personId: 'p-vishnu',
      cycleId: 'cycle-vishnu-1',
      date: getOffsetDateStr(-2),
      meals: { morning: 1, afternoon: 1, night: 0 },
      pricePerMeal: 50,
      totalMeals: 2,
      totalCost: 100,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'mr-vishnu-2',
      personId: 'p-vishnu',
      cycleId: 'cycle-vishnu-1',
      date: getOffsetDateStr(-1),
      meals: { morning: 1, afternoon: 1, night: 1 },
      pricePerMeal: 50,
      totalMeals: 3,
      totalCost: 150,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    // Abhi records
    {
      id: 'mr-abhi-1',
      personId: 'p-abhi',
      cycleId: 'cycle-abhi-1',
      date: getOffsetDateStr(-1),
      meals: { morning: 1, afternoon: 0, night: 1 },
      pricePerMeal: 50,
      totalMeals: 2,
      totalCost: 100,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  paymentReceipts: [],
};
