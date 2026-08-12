import React, { useState } from 'react';
import { Person, AppData } from '../types';
import { calculatePersonBalance } from '../lib/trackerStore';
import {
  X,
  User,
  Utensils,
  CheckCircle2,
  Receipt,
  Calendar,
  History,
  Edit2,
  Trash2,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

interface PersonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  appData: AppData;
  onOpenRecordMealForPerson: (person: Person, date?: string) => void;
  onPaidAndReset: (person: Person) => void;
  onDeleteMealRecord: (recordId: string) => void;
}

export const PersonDetailsModal: React.FC<PersonDetailsModalProps> = ({
  isOpen,
  onClose,
  person,
  appData,
  onOpenRecordMealForPerson,
  onPaidAndReset,
  onDeleteMealRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'payments'>('current');

  if (!isOpen || !person) return null;

  const balance = calculatePersonBalance(person, appData);

  // Active cycle meal records
  const activeRecords = appData.mealRecords.filter(
    r => r.personId === person.id && r.cycleId === person.activeCycleId
  ).sort((a, b) => b.date.localeCompare(a.date));

  // All meal records
  const allRecords = appData.mealRecords.filter(
    r => r.personId === person.id
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Payment receipts for this person
  const receipts = appData.paymentReceipts.filter(
    pr => pr.personId === person.id
  ).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl relative my-8 max-h-[90vh] flex flex-col text-slate-800 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0c1322] text-white p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#00b87c] text-white flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-xs">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {person.name}
                </h2>
                <span className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Cycle #{balance.cycleNumber}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">
                Joined: {person.createdAt || '8/1/2026'} • Active Cycle started {balance.startDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => onOpenRecordMealForPerson(person)}
              className="flex items-center gap-1.5 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>

            <button
              onClick={() => onPaidAndReset(person)}
              disabled={balance.unpaidMeals <= 0}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs transition-all cursor-pointer border border-slate-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00b87c]" />
              <span>Paid & Reset</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col space-y-5 sm:space-y-6">
          {/* Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Unpaid Meals
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {balance.unpaidMeals} <span className="text-xs font-medium text-slate-400">meals</span>
              </span>
            </div>

            <div
              className={
                balance.amountDue > 0
                  ? 'bg-[#fffdf0] border border-[#fde68a]/80 rounded-2xl p-3.5 sm:p-4'
                  : 'bg-[#ecfdf5] border border-[#a7f3d0]/80 rounded-2xl p-3.5 sm:p-4'
              }
            >
              <span
                className={
                  balance.amountDue > 0
                    ? 'text-[10px] font-bold text-amber-600/90 uppercase tracking-widest block mb-1'
                    : 'text-[10px] font-bold text-emerald-600/90 uppercase tracking-widest block mb-1'
                }
              >
                Amount Due
              </span>
              <span
                className={
                  balance.amountDue > 0
                    ? 'text-xl sm:text-2xl font-extrabold text-[#b45309]'
                    : 'text-xl sm:text-2xl font-extrabold text-[#047857]'
                }
              >
                ₹{balance.amountDue}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                Active Cycle
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                #{balance.cycleNumber} <span className="text-[11px] text-slate-400 font-medium">({balance.startDate})</span>
              </span>
            </div>
          </div>

          {/* Navigation Tabs - Horizontally Scrollable on Mobile */}
          <div className="flex items-center border-b border-slate-200 space-x-4 sm:space-x-6 text-xs font-bold uppercase tracking-wider overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab('current')}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'current'
                  ? 'text-[#00b87c] border-b-2 border-[#00b87c]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Current Cycle ({activeRecords.length})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-[#00b87c] border-b-2 border-[#00b87c]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              All History ({allRecords.length})
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'text-[#00b87c] border-b-2 border-[#00b87c]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Receipts ({receipts.length})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 space-y-4">
            {/* TAB 1: Current Unpaid Cycle */}
            {activeTab === 'current' && (
              <div>
                {activeRecords.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200/80">
                          <tr>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5 text-center">Morning</th>
                            <th className="p-3.5 text-center">Afternoon</th>
                            <th className="p-3.5 text-center">Night</th>
                            <th className="p-3.5 text-center">Total Meals</th>
                            <th className="p-3.5 text-right">Cost</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium">
                          {activeRecords.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                                {r.date}
                              </td>
                              <td className="p-3.5 text-center">{r.meals.morning}</td>
                              <td className="p-3.5 text-center">{r.meals.afternoon}</td>
                              <td className="p-3.5 text-center">{r.meals.night}</td>
                              <td className="p-3.5 text-center font-bold text-slate-900">
                                {r.totalMeals}
                              </td>
                              <td className="p-3.5 text-right font-bold text-[#00b87c] whitespace-nowrap">
                                ₹{r.totalCost}
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => onOpenRecordMealForPerson(person, r.date)}
                                  className="p-1.5 text-slate-600 hover:text-[#00b87c] hover:bg-emerald-50 rounded-lg mr-1 transition-colors cursor-pointer"
                                  title="Edit meal entry"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete meal record for ${r.date}?`)) {
                                      onDeleteMealRecord(r.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card List */}
                    <div className="block sm:hidden divide-y divide-slate-100">
                      {activeRecords.map(r => (
                        <div key={r.id} className="p-3.5 bg-white space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{r.date}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onOpenRecordMealForPerson(person, r.date)}
                                className="p-1.5 text-slate-600 hover:text-[#00b87c] bg-slate-50 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete meal record for ${r.date}?`)) {
                                    onDeleteMealRecord(r.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2 rounded-lg text-xs font-semibold">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block">Morning</span>
                              <span>{r.meals.morning}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block">Afternoon</span>
                              <span>{r.meals.afternoon}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block">Night</span>
                              <span>{r.meals.night}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="text-slate-500">{r.totalMeals} meals</span>
                            <span className="font-bold text-[#00b87c]">₹{r.totalCost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-slate-600">
                    <CheckCircle2 className="w-8 h-8 text-[#00b87c] mx-auto mb-2" />
                    <p className="font-bold text-slate-900 text-sm">No unpaid meals in Cycle #{balance.cycleNumber}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      All clear! Use "Record Meal" to add new daily meal entries.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: All Meal History */}
            {activeTab === 'all' && (
              <div>
                {allRecords.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200/80">
                        <tr>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Cycle</th>
                          <th className="p-3.5 text-center">Breakdown (M/A/N)</th>
                          <th className="p-3.5 text-center">Meals</th>
                          <th className="p-3.5 text-right">Cost</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-medium">
                        {allRecords.map(r => {
                          const cycle = appData.billingCycles.find(c => c.id === r.cycleId);
                          const isCurrentActive = r.cycleId === person.activeCycleId;

                          return (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                                {r.date}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span
                                  className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                                    isCurrentActive
                                      ? 'bg-emerald-50 text-[#00b87c] border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  Cycle #{cycle?.cycleNumber || '?'} {isCurrentActive ? '(Active)' : '(Paid)'}
                                </span>
                              </td>
                              <td className="p-3.5 text-center font-mono text-slate-500">
                                {r.meals.morning} / {r.meals.afternoon} / {r.meals.night}
                              </td>
                              <td className="p-3.5 text-center font-bold text-slate-900">
                                {r.totalMeals}
                              </td>
                              <td className="p-3.5 text-right font-bold text-[#00b87c] whitespace-nowrap">
                                ₹{r.totalCost}
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => onOpenRecordMealForPerson(person, r.date)}
                                  className="p-1.5 text-slate-600 hover:text-[#00b87c] hover:bg-emerald-50 rounded-lg mr-1 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete meal record for ${r.date}?`)) {
                                      onDeleteMealRecord(r.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-slate-600">
                    <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-900 text-sm">No meal history recorded yet</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Payment Receipts */}
            {activeTab === 'payments' && (
              <div>
                {receipts.length > 0 ? (
                  <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200/80">
                        <tr>
                          <th className="p-3.5">Payment Date</th>
                          <th className="p-3.5">Cycle</th>
                          <th className="p-3.5 text-center">Meals Settled</th>
                          <th className="p-3.5 text-right">Amount Received</th>
                          <th className="p-3.5">Note / Method</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white font-medium">
                        {receipts.map(pr => (
                          <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                              {pr.paymentDate}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 text-[10px] rounded-full border border-slate-200">
                                Cycle #{pr.cycleNumber}
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-bold text-slate-900">
                              {pr.mealsPaid} meals
                            </td>
                            <td className="p-3.5 text-right font-extrabold text-[#00b87c] whitespace-nowrap">
                              ₹{pr.amountPaid}
                            </td>
                            <td className="p-3.5 text-slate-500 italic">
                              {pr.note || 'Cash/Online'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-slate-600">
                    <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-slate-900 text-sm">No payment receipts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      When meals are paid and reset, receipts will appear here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

