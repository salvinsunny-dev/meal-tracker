import React, { useState } from 'react';
import { AppData, Person } from '../types';
import {
  Search,
  Filter,
  PlusCircle,
  History,
  Edit2,
  Trash2,
  Calendar,
  Utensils,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';

interface AllMealsHistoryProps {
  appData: AppData;
  onOpenRecordMeal: (person?: Person, date?: string) => void;
  onDeleteMealRecord: (recordId: string) => void;
}

export const AllMealsHistory: React.FC<AllMealsHistoryProps> = ({
  appData,
  onOpenRecordMeal,
  onDeleteMealRecord,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const filteredRecords = appData.mealRecords
    .filter(r => {
      if (selectedPersonId !== 'ALL' && r.personId !== selectedPersonId) return false;
      if (selectedDate && r.date !== selectedDate) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalFilteredMeals = filteredRecords.reduce((sum, r) => sum + r.totalMeals, 0);
  const totalFilteredCost = filteredRecords.reduce((sum, r) => sum + r.totalCost, 0);

  const getPersonName = (personId: string) => {
    return appData.persons.find(p => p.id === personId)?.name || 'Unknown';
  };

  const getPerson = (personId: string) => {
    return appData.persons.find(p => p.id === personId);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner & Action */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            RECORD ARCHIVE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-[#00b87c]" />
            Global Meal Log History
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Complete database of all recorded daily meals across all accounts
          </p>
        </div>

        <button
          onClick={() => onOpenRecordMeal()}
          className="flex items-center justify-center gap-2 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Meal Entry</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Person Dropdown Filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter Member
            </label>
            <select
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00b87c] cursor-pointer"
            >
              <option value="ALL">All Members ({appData.persons.length})</option>
              {appData.persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter Specific Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00b87c] cursor-pointer"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedPersonId !== 'ALL' || selectedDate) && (
          <button
            onClick={() => {
              setSelectedPersonId('ALL');
              setSelectedDate('');
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer self-end sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Total Records</span>
          <span className="text-2xl font-extrabold text-slate-900">{filteredRecords.length}</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Total Meals</span>
          <span className="text-2xl font-extrabold text-slate-900">{totalFilteredMeals}</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Total Cost</span>
          <span className="text-2xl font-extrabold text-[#00b87c]">₹{totalFilteredCost}</span>
        </div>
      </div>

      {/* Records Listing: Desktop Table & Mobile Card Layout */}
      {filteredRecords.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Morning</th>
                  <th className="p-3.5 text-center">Afternoon</th>
                  <th className="p-3.5 text-center">Night</th>
                  <th className="p-3.5 text-center">Total Meals</th>
                  <th className="p-3.5 text-right">Daily Cost</th>
                  <th className="p-3.5 text-center">Cycle Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {filteredRecords.map(r => {
                  const personName = getPersonName(r.personId);
                  const personObj = getPerson(r.personId);
                  const cycle = appData.billingCycles.find(c => c.id === r.cycleId);
                  const isCurrentActive = personObj?.activeCycleId === r.cycleId;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {personName}
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
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
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${
                            isCurrentActive
                              ? 'bg-emerald-50 text-[#00b87c] border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          Cycle #{cycle?.cycleNumber || 1} {isCurrentActive ? '(Unpaid)' : '(Settled)'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenRecordMeal(personObj, r.date)}
                          className="p-1.5 text-slate-600 hover:text-[#00b87c] hover:bg-emerald-50 rounded-lg mr-1 transition-colors cursor-pointer"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete meal entry for ${personName} on ${r.date}?`)) {
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (Visible on Small Screens) */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {filteredRecords.map(r => {
              const personName = getPersonName(r.personId);
              const personObj = getPerson(r.personId);
              const cycle = appData.billingCycles.find(c => c.id === r.cycleId);
              const isCurrentActive = personObj?.activeCycleId === r.cycleId;

              return (
                <div key={r.id} className="p-4 bg-white space-y-3">
                  {/* Top row: Name, Cycle Badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{personName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            isCurrentActive
                              ? 'bg-emerald-50 text-[#00b87c] border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          Cycle #{cycle?.cycleNumber || 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenRecordMeal(personObj, r.date)}
                        className="p-2 text-slate-600 hover:text-[#00b87c] bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete meal entry for ${personName} on ${r.date}?`)) {
                            onDeleteMealRecord(r.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meals Breakdown Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Morning</span>
                      <span className="font-bold text-slate-900">{r.meals.morning}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Afternoon</span>
                      <span className="font-bold text-slate-900">{r.meals.afternoon}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-medium">Night</span>
                      <span className="font-bold text-slate-900">{r.meals.night}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Total Meals & Daily Cost */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 font-medium">
                      Total: <strong className="text-slate-900">{r.totalMeals} meals</strong>
                    </span>
                    <span className="text-sm font-extrabold text-[#00b87c]">
                      ₹{r.totalCost}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-600 max-w-md mx-auto shadow-2xs">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No meal records found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try resetting your filters or record a new daily meal.
          </p>
          <button
            onClick={() => onOpenRecordMeal()}
            className="inline-flex items-center gap-2 bg-[#00b87c] text-white hover:bg-[#00a36d] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Meal Now</span>
          </button>
        </div>
      )}
    </div>
  );
};

