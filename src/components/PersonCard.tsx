import React from 'react';
import { Person, AppData } from '../types';
import {
  calculatePersonBalance,
  calculateTodayMealForPerson,
  isSlotLocked,
  getSlotUnlockTime,
} from '../lib/trackerStore';
import { getTodayStr } from '../data/initialData';
import {
  User,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  Trash2,
  Sun,
  SunMedium,
  Moon,
  Calendar,
} from 'lucide-react';

interface PersonCardProps {
  person: Person;
  appData: AppData;
  onViewDetails: (person: Person) => void;
  onPaidAndReset: (person: Person) => void;
  onRemovePerson: (person: Person) => void;
  onEditTodayMeal: (person: Person) => void;
  onQuickUpdateMeal: (
    personId: string,
    slot: 'morning' | 'afternoon' | 'night',
    delta: number
  ) => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  appData,
  onViewDetails,
  onPaidAndReset,
  onRemovePerson,
  onEditTodayMeal,
  onQuickUpdateMeal,
}) => {
  const balance = calculatePersonBalance(person, appData);
  const todayMeal = calculateTodayMealForPerson(person.id, appData);
  const todayStr = getTodayStr();

  const isMorningLocked = isSlotLocked('morning', todayStr);
  const isAfternoonLocked = isSlotLocked('afternoon', todayStr);
  const isNightLocked = isSlotLocked('night', todayStr);

  const todayCount = todayMeal.morning + todayMeal.afternoon + todayMeal.night;
  const todayAmount = todayCount * appData.settings.pricePerMeal;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-md transition-all flex flex-col justify-between relative group">
      <div>
        {/* Card Header: Person Name, Cycle # & Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {person.name}
              </h3>
              <span className="bg-slate-100 border border-slate-200/60 text-slate-500 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Cycle #{balance.cycleNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Current Billing Cycle started {balance.startDate}
            </p>
          </div>

          {/* Status Badge */}
          {balance.unpaidMeals > 0 ? (
            <div className="flex items-center gap-1 bg-[#fff8ec] text-[#d97706] border border-[#fef3c7] px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Payment Due</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Paid</span>
            </div>
          )}
        </div>

        {/* 2 Stat Metric Boxes */}
        <div className="grid grid-cols-2 gap-3 my-5">
          {/* Unpaid Meals Box */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              UNPAID MEALS
            </span>
            <span className="text-3xl font-extrabold text-slate-900">
              {balance.unpaidMeals}
            </span>
          </div>

          {/* Amount Due Box */}
          <div
            className={
              balance.amountDue > 0
                ? 'bg-[#fffdf0] border border-[#fde68a]/80 rounded-2xl p-4 text-center'
                : 'bg-[#ecfdf5] border border-[#a7f3d0]/80 rounded-2xl p-4 text-center'
            }
          >
            <span
              className={
                balance.amountDue > 0
                  ? 'text-[10px] font-bold text-amber-600/90 uppercase tracking-widest block mb-1'
                  : 'text-[10px] font-bold text-emerald-600/90 uppercase tracking-widest block mb-1'
              }
            >
              AMOUNT DUE
            </span>
            <span
              className={
                balance.amountDue > 0
                  ? 'text-3xl font-extrabold text-[#b45309]'
                  : 'text-3xl font-extrabold text-[#047857]'
              }
            >
              ₹{balance.amountDue}
            </span>
          </div>
        </div>

        {/* Today's Meals Section */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              Today's Meals: <span className="font-bold text-slate-900">{todayCount}</span>{' '}
              <span className="text-slate-400">(₹{todayAmount})</span>
            </span>
            <button
              onClick={() => onEditTodayMeal(person)}
              className="font-bold text-[#00b87c] hover:underline cursor-pointer"
            >
              Edit Today's Meal
            </button>
          </div>

          {/* 3 Slot Chips */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Morning */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center flex flex-col justify-between min-h-[56px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Morning</span>
              </div>

              {isMorningLocked ? (
                <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{getSlotUnlockTime('morning')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'morning', -1)}
                    disabled={todayMeal.morning <= 0}
                    className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-slate-800 text-xs">{todayMeal.morning}</span>
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'morning', 1)}
                    className="w-5 h-5 rounded-md bg-[#00b87c] text-white flex items-center justify-center hover:bg-[#00a36d] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Afternoon */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center flex flex-col justify-between min-h-[56px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
                <SunMedium className="w-3 h-3 text-amber-600" />
                <span>Afternoon</span>
              </div>

              {isAfternoonLocked ? (
                <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>After 2:00 PM</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'afternoon', -1)}
                    disabled={todayMeal.afternoon <= 0}
                    className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-slate-800 text-xs">{todayMeal.afternoon}</span>
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'afternoon', 1)}
                    className="w-5 h-5 rounded-md bg-[#00b87c] text-white flex items-center justify-center hover:bg-[#00a36d] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Night */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 text-center flex flex-col justify-between min-h-[56px]">
              <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
                <Moon className="w-3 h-3 text-indigo-500" />
                <span>Night</span>
              </div>

              {isNightLocked ? (
                <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>After 8:00 PM</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'night', -1)}
                    disabled={todayMeal.night <= 0}
                    className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-slate-800 text-xs">{todayMeal.night}</span>
                  <button
                    onClick={() => onQuickUpdateMeal(person.id, 'night', 1)}
                    className="w-5 h-5 rounded-md bg-[#00b87c] text-white flex items-center justify-center hover:bg-[#00a36d] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons & Footer */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(person)}
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Details</span>
          </button>

          <button
            onClick={() => onPaidAndReset(person)}
            disabled={balance.unpaidMeals <= 0}
            className={
              balance.unpaidMeals > 0
                ? 'flex-1 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs shadow-emerald-500/10 transition-all cursor-pointer active:scale-95'
                : 'flex-1 bg-slate-100 text-slate-400 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed'
            }
          >
            <Check className="w-3.5 h-3.5" />
            <span>Paid & Reset</span>
          </button>
        </div>

        {/* Bottom Subtext Row */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
          <span>Created: {person.createdAt || '8/1/2026'}</span>
          <button
            onClick={() => onRemovePerson(person)}
            className="hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
};

