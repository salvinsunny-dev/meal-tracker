import React, { useState } from 'react';
import { Person, AppData } from '../types';
import { calculatePersonBalance } from '../lib/trackerStore';
import { getTodayStr } from '../data/initialData';
import { X, CheckCircle2, IndianRupee, FileText, AlertCircle } from 'lucide-react';

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  appData: AppData;
  onConfirmPayment: (
    person: Person,
    settledMeals: number,
    settledAmount: number,
    note: string
  ) => void;
}

export const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  person,
  appData,
  onConfirmPayment,
}) => {
  const [note, setNote] = useState('');

  if (!isOpen || !person) return null;

  const balance = calculatePersonBalance(person, appData);
  const today = getTodayStr();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (balance.unpaidMeals <= 0) return;

    onConfirmPayment(
      person,
      balance.unpaidMeals,
      balance.amountDue,
      note.trim() || 'Settled via cash/online'
    );

    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c1322] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Confirm Payment & Reset</h3>
              <p className="text-xs text-slate-300 font-medium">
                Settle current cycle for <span className="font-bold text-white">{person.name}</span>
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

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {/* Summary Box */}
          <div className="bg-[#e6f7f0] border border-[#a7f3d0] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">CURRENT BILLING CYCLE:</span>
              <span className="font-bold text-slate-900">Cycle #{balance.cycleNumber}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">TOTAL UNPAID MEALS:</span>
              <span className="font-bold text-slate-900">{balance.unpaidMeals} meals</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#a7f3d0]">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">TOTAL AMOUNT RECEIVED:</span>
              <span className="text-2xl font-extrabold text-[#00b87c]">
                ₹{balance.amountDue}
              </span>
            </div>
          </div>

          {/* Payment Method / Note */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              PAYMENT METHOD / NOTE <span className="text-slate-400 font-normal">(OPTIONAL)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. GPay, Cash, PhonePe, UPI"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00b87c]"
              />
            </div>
          </div>

          {/* Explanation Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block uppercase tracking-wider text-[10px]">CYCLE RESET ACTION:</span>
              <span className="text-slate-500 font-medium">
                This will mark Cycle #{balance.cycleNumber} as PAID, save a payment receipt dated {today}, and launch Cycle #{balance.cycleNumber + 1} with ₹0 balance.
              </span>
            </div>
          </div>

          {/* Modal Actions */}
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
              className="bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Confirm Paid & Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

