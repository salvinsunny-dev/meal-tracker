import React, { useState } from 'react';
import { AppData } from '../types';
import { Receipt, Search, RefreshCw, CheckCircle2, IndianRupee, Utensils } from 'lucide-react';

interface PaymentHistoryViewProps {
  appData: AppData;
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({ appData }) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredReceipts = appData.paymentReceipts
    .filter(pr => {
      if (selectedPersonId !== 'ALL' && pr.personId !== selectedPersonId) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = pr.personName.toLowerCase().includes(query);
        const noteMatch = (pr.note || '').toLowerCase().includes(query);
        const dateMatch = pr.paymentDate.includes(query);
        return nameMatch || noteMatch || dateMatch;
      }
      return true;
    })
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  const totalRevenue = filteredReceipts.reduce((sum, pr) => sum + pr.amountPaid, 0);
  const totalMealsSettled = filteredReceipts.reduce((sum, pr) => sum + pr.mealsPaid, 0);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            SETTLEMENT AUDIT LOG
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#00b87c]" />
            Payment History & Receipts
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Audit log of all settled billing cycles and payments received
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Person Dropdown */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter Member
            </label>
            <select
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00b87c] cursor-pointer"
            >
              <option value="ALL">All Members</option>
              {appData.persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Text Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Note or Date
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search GPay, cash, date..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00b87c]"
              />
            </div>
          </div>
        </div>

        {/* Reset Filter Button */}
        {(selectedPersonId !== 'ALL' || searchTerm) && (
          <button
            onClick={() => {
              setSelectedPersonId('ALL');
              setSearchTerm('');
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer self-end sm:self-center"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Total Revenue Collected</span>
            <span className="text-2xl font-extrabold text-[#00b87c]">₹{totalRevenue}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Total Meals Settled</span>
            <span className="text-2xl font-extrabold text-slate-900">{totalMealsSettled} meals</span>
          </div>
        </div>
      </div>

      {/* Payment Receipts Listing: Desktop Table & Mobile Cards */}
      {filteredReceipts.length > 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Cycle #</th>
                  <th className="p-3.5 text-center">Meals Settled</th>
                  <th className="p-3.5 text-right">Amount Received</th>
                  <th className="p-3.5">Note / Payment Method</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {filteredReceipts.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {pr.personName}
                    </td>
                    <td className="p-3.5 text-slate-600 whitespace-nowrap">
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
                    <td className="p-3.5 text-slate-500 italic whitespace-nowrap">
                      {pr.note || 'Cash/Online'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#00b87c] border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-[#00b87c]" />
                        PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View Layout */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {filteredReceipts.map(pr => (
              <div key={pr.id} className="p-4 bg-white space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{pr.personName}</span>
                      <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 text-[10px] rounded-full border border-slate-200">
                        Cycle #{pr.cycleNumber}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Paid on {pr.paymentDate}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#00b87c] border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold rounded-full shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#00b87c]" />
                    PAID
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Meals Settled</span>
                    <span className="font-bold text-slate-900">{pr.mealsPaid} meals</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-medium block">Amount Paid</span>
                    <span className="text-base font-extrabold text-[#00b87c]">₹{pr.amountPaid}</span>
                  </div>
                </div>

                {pr.note && (
                  <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg">
                    Note: {pr.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-600 max-w-md mx-auto shadow-2xs">
          <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No payment receipts found</h3>
          <p className="text-xs text-slate-500 mt-1">
            When you settle a balance via "Paid & Reset", payment receipts will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

