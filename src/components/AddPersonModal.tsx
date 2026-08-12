import React, { useState } from 'react';
import { AppData, Person, BillingCycle } from '../types';
import { getTodayStr } from '../data/initialData';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onPersonAdded: (newPerson: Person, newCycle: BillingCycle) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  appData,
  onPersonAdded,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Please enter a person name.');
      return;
    }

    // Duplicate check
    const duplicate = appData.persons.some(
      p => p.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicate) {
      setError(`A person named "${trimmed}" already exists.`);
      return;
    }

    const today = getTodayStr();
    const personId = `person-${Date.now()}`;
    const cycleId = `cycle-${personId}-1`;

    const newPerson: Person = {
      id: personId,
      name: trimmed,
      createdAt: today,
      activeCycleId: cycleId,
    };

    const newCycle: BillingCycle = {
      id: cycleId,
      personId,
      cycleNumber: 1,
      startDate: today,
      status: 'ACTIVE',
    };

    onPersonAdded(newPerson, newCycle);
    setName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c1322] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Add New Person</h3>
              <p className="text-xs text-slate-300 font-medium">
                Create an independent meal account and billing cycle
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              PERSON NAME <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul, Sneha, Alex"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00b87c]"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">INITIAL SETUP PARAMETERS:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 font-medium">
              <li>Billing Cycle #1 starts automatically today</li>
              <li>Initial unpaid balance is set to ₹0</li>
              <li>Individual meal logging available immediately</li>
            </ul>
          </div>

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
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

