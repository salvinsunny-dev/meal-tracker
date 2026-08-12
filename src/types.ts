export interface MealEntry {
  morning: number;
  afternoon: number;
  night: number;
}

export interface MealRecord {
  id: string;
  personId: string;
  cycleId: string;
  date: string; // YYYY-MM-DD
  meals: MealEntry;
  pricePerMeal: number; // Price per meal at the time recorded
  totalMeals: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillingCycle {
  id: string;
  personId: string;
  cycleNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD when settled
  status: 'ACTIVE' | 'PAID';
}

export interface PaymentReceipt {
  id: string;
  personId: string;
  personName: string;
  cycleId: string;
  cycleNumber: number;
  paymentDate: string; // YYYY-MM-DD or ISO string
  mealsPaid: number;
  amountPaid: number;
  note?: string; // e.g., "Cash", "GPay", "UPI"
  createdAt: string;
}

export interface Person {
  id: string;
  name: string;
  createdAt: string; // YYYY-MM-DD
  activeCycleId: string;
}

export interface AppSettings {
  pricePerMeal: number; // e.g. 50
}

export interface AppData {
  persons: Person[];
  billingCycles: BillingCycle[];
  mealRecords: MealRecord[];
  paymentReceipts: PaymentReceipt[];
  settings: AppSettings;
}

export type NavTab = 'dashboard' | 'log-meals' | 'all-meals' | 'payments' | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}
