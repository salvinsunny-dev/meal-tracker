import mongoose, { Schema, Document, Model } from 'mongoose';
import { AppData } from '../types';

// We store the entire AppData as a single document in MongoDB.
// This matches the existing architecture (one blob of state) and avoids
// complex multi-collection joins in serverless functions.
// The document is identified by a fixed singleton key "main".

export interface AppDataDocument extends Document {
  _key: string; // always "main"
  data: AppData;
  updatedAt: Date;
}

const MealEntrySchema = new Schema(
  {
    morning: { type: Number, default: 0 },
    afternoon: { type: Number, default: 0 },
    night: { type: Number, default: 0 },
  },
  { _id: false }
);

const MealRecordSchema = new Schema(
  {
    id: { type: String, required: true },
    personId: { type: String, required: true },
    cycleId: { type: String, required: true },
    date: { type: String, required: true },
    meals: { type: MealEntrySchema, required: true },
    pricePerMeal: { type: Number, required: true },
    totalMeals: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const BillingCycleSchema = new Schema(
  {
    id: { type: String, required: true },
    personId: { type: String, required: true },
    cycleNumber: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    status: { type: String, enum: ['ACTIVE', 'PAID'], required: true },
  },
  { _id: false }
);

const PaymentReceiptSchema = new Schema(
  {
    id: { type: String, required: true },
    personId: { type: String, required: true },
    personName: { type: String, required: true },
    cycleId: { type: String, required: true },
    cycleNumber: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    mealsPaid: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    note: { type: String },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const PersonSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    activeCycleId: { type: String, required: true },
  },
  { _id: false }
);

const AppSettingsSchema = new Schema(
  {
    pricePerMeal: { type: Number, required: true, default: 50 },
  },
  { _id: false }
);

const AppDataSchema = new Schema<AppDataDocument>(
  {
    _key: { type: String, required: true, unique: true, default: 'main' },
    data: {
      settings: { type: AppSettingsSchema, required: true },
      persons: { type: [PersonSchema], default: [] },
      billingCycles: { type: [BillingCycleSchema], default: [] },
      mealRecords: { type: [MealRecordSchema], default: [] },
      paymentReceipts: { type: [PaymentReceiptSchema], default: [] },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    // Disable automatic Mongoose _id on subdocs since we use string ids
    versionKey: false,
  }
);

// Prevent model recompilation in hot-reload / serverless environments
export const AppDataModel: Model<AppDataDocument> =
  (mongoose.models.AppData as Model<AppDataDocument>) ||
  mongoose.model<AppDataDocument>('AppData', AppDataSchema);
