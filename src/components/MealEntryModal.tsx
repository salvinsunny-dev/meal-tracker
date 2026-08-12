import React, { useState, useEffect } from 'react';
import { AppData, MealRecord } from '../types';
import { getTodayStr } from '../data/initialData';
import { isSlotLocked } from '../lib/trackerStore';
import {
  X,
  Utensils,
  Sun,
  SunMedium,
  Moon,
  Plus,
  Minus,
  Calendar,
  Clock,
  Check,
} from 'lucide-react';

interface MealEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  preselectedPersonId?: string;
  preselectedDate?: string;
  onSaveMeal: (mealRecord: Omit<MealRecord, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
}

export const MealEntryModal: React.FC<MealEntryModalProps> = ({
  isOpen,
  onClose,
  appData,
  preselectedPersonId,
  preselectedDate,
  onSaveMeal,
}) => {
  const today = getTodayStr();

  const [personId, setPersonId] = useState<string>('');
  const [date, setDate] = useState<string>(today);
  const [morning, setMorning] = useState<number>(0);
  const [afternoon, setAfternoon] = useState<number>(0);
  const [night, setNight] = useState<number>(0);

  // Initialize or update fields when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const targetPersonId = preselectedPersonId || (appData.persons[0]?.id ?? '');
    const targetDate = preselectedDate || today;

    setPersonId(targetPersonId);
    setDate(targetDate);

    // Load existing record if available
    const existing = appData.mealRecords.find(
      r => r.personId === targetPersonId && r.date === targetDate
    );

    if (existing) {
      setMorning(existing.meals.morning || 0);
      setAfternoon(existing.meals.afternoon || 0);
      setNight(existing.meals.night || 0);
    } else {
      setMorning(0);
      setAfternoon(0);
      setNight(0);
    }
  }, [isOpen, preselectedPersonId, preselectedDate, appData.mealRecords, appData.persons, today]);

  // When person or date changes, reload record
  const handlePersonOrDateChange = (newPersonId: string, newDate: string) => {
    setPersonId(newPersonId);
    setDate(newDate);

    const existing = appData.mealRecords.find(
      r => r.personId === newPersonId && r.date === newDate
    );

    if (existing) {
      setMorning(existing.meals.morning || 0);
      setAfternoon(existing.meals.afternoon || 0);
      setNight(existing.meals.night || 0);
    } else {
      setMorning(0);
      setAfternoon(0);
      setNight(0);
    }
  };

  if (!isOpen) return null;

  const currentPerson = appData.persons.find(p => p.id === personId);
  const isToday = date === today;

  const morningLocked = isSlotLocked('morning', date);
  const afternoonLocked = isSlotLocked('afternoon', date);
  const nightLocked = isSlotLocked('night', date);

  const pricePerMeal = appData.settings.pricePerMeal || 50;
  const totalMeals = morning + afternoon + night;
  const totalCost = totalMeals * pricePerMeal;

  const existingRecord = appData.mealRecords.find(
    r => r.personId === personId && r.date === date
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPerson) return;

    onSaveMeal(
      {
        personId,
        cycleId: currentPerson.activeCycleId,
        date,
        meals: { morning, afternoon, night },
        pricePerMeal,
        totalMeals,
        totalCost,
      },
      existingRecord?.id
    );

    onClose();
  };

  // Helper for formatted date
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative my-8 text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c1322] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {existingRecord ? 'Edit Daily Meal' : 'Record Daily Meal'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Specify consumption per person and meal time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* PERSON SELECTOR */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              PERSON
            </label>
            <select
              value={personId}
              onChange={e => handlePersonOrDateChange(e.target.value, date)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00b87c] cursor-pointer"
            >
              {appData.persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* DATE SELECTOR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>DATE</span>
              </label>
              {date !== today && (
                <button
                  type="button"
                  onClick={() => handlePersonOrDateChange(personId, today)}
                  className="text-xs font-bold text-[#00b87c] hover:underline cursor-pointer"
                >
                  Set to Today
                </button>
              )}
            </div>
            <input
              type="date"
              max={today}
              value={date}
              onChange={e => handlePersonOrDateChange(personId, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00b87c] cursor-pointer"
            />
            <p className="text-xs text-slate-400 font-medium mt-1">
              Formatted: <span className="font-bold text-slate-700">{formatDateDisplay(date)}</span>
            </p>
          </div>

          {/* MEAL TIMES SECTION */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              MEAL TIMES{' '}
              <span className="text-slate-400 font-normal normal-case">
                ({isToday ? 'today — only past meal times can be logged' : 'unlocked for editing'})
              </span>
            </div>

            {/* Morning Row */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Morning</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Breakfast</p>
                </div>
              </div>

              {morningLocked ? (
                <div className="bg-slate-100/80 border border-slate-200/80 text-slate-500 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available after 9:00 AM</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMorning(Math.max(0, morning - 1))}
                    disabled={morning <= 0}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {morning}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMorning(morning + 1)}
                    className="w-8 h-8 rounded-lg bg-[#00b87c] text-white hover:bg-[#00a36d] flex items-center justify-center transition-colors cursor-pointer font-bold shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Afternoon Row */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <SunMedium className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Afternoon</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Lunch</p>
                </div>
              </div>

              {afternoonLocked ? (
                <div className="bg-slate-100/80 border border-slate-200/80 text-slate-500 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available after 2:00 PM</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAfternoon(Math.max(0, afternoon - 1))}
                    disabled={afternoon <= 0}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {afternoon}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAfternoon(afternoon + 1)}
                    className="w-8 h-8 rounded-lg bg-[#00b87c] text-white hover:bg-[#00a36d] flex items-center justify-center transition-colors cursor-pointer font-bold shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Night Row */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Night</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Dinner</p>
                </div>
              </div>

              {nightLocked ? (
                <div className="bg-slate-100/80 border border-slate-200/80 text-slate-500 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Available after 8:00 PM</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNight(Math.max(0, night - 1))}
                    disabled={night <= 0}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-slate-900">
                    {night}
                  </span>
                  <button
                    type="button"
                    onClick={() => setNight(night + 1)}
                    className="w-8 h-8 rounded-lg bg-[#00b87c] text-white hover:bg-[#00a36d] flex items-center justify-center transition-colors cursor-pointer font-bold shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mint Green Daily Summary Card */}
          <div className="bg-[#e6f7f0] border border-[#a7f3d0] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                DAILY SUMMARY
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                Total: {totalMeals} {totalMeals === 1 ? 'meal' : 'meals'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                DAILY AMOUNT
              </span>
              <span className="text-2xl font-extrabold text-[#00b87c]">
                ₹{totalCost}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 font-medium text-xs px-4 py-2 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Meal Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

