import React from 'react';
import { NavTab } from '../types';
import {
  Utensils,
  PlusCircle,
  LayoutGrid,
  History,
  Receipt,
  Settings,
  Plus,
} from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  pricePerMeal: number;
  totalPersons: number;
  totalUnpaidDues: number;
  onOpenRecordMeal: () => void;
  onOpenAddPerson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pricePerMeal,
  totalPersons,
  totalUnpaidDues,
  onOpenRecordMeal,
  onOpenAddPerson,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c1322] text-white shadow-md border-b border-[#18233c]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Branding & Primary Actions Row */}
        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-slate-800/80 gap-2 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">
                Meal Tracker
              </h1>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-[#00b87c]/20 border border-[#00b87c]/40 text-[#10b981] px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap">
                  ₹{pricePerMeal}/meal
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden xs:inline">
                  • {totalPersons} {totalPersons === 1 ? 'Person' : 'People'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenRecordMeal}
              className="bg-[#00b87c] hover:bg-[#00a36d] text-white text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="Record Meal"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Record Meal</span>
              <span className="xs:hidden">Meal</span>
            </button>

            <button
              onClick={onOpenAddPerson}
              className="bg-[#152038] hover:bg-[#1c2a4a] border border-[#233358] text-slate-200 hover:text-white text-xs font-semibold px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="Add Person"
            >
              <PlusCircle className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">+ Add Person</span>
              <span className="sm:hidden">+ Person</span>
            </button>
          </div>
        </div>

        {/* Sub-header Stats & Note Row */}
        <div className="flex items-center justify-between py-2 text-xs text-slate-300 border-b border-slate-800/60">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[11px] sm:text-xs text-slate-400">Unpaid Dues:</span>
            <span className="bg-amber-400/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-md text-xs">
              ₹{totalUnpaidDues}
            </span>
          </div>
          <div className="text-slate-400 text-[11px] italic hidden sm:block">
            Each person's balance is calculated independently
          </div>
          <div className="text-slate-400 text-[11px] font-medium sm:hidden">
            {totalPersons} {totalPersons === 1 ? 'Person' : 'People'}
          </div>
        </div>

        {/* Desktop Navigation Tabs Row (Hidden on Mobile as Mobile Uses Bottom Nav) */}
        <nav className="hidden md:flex items-center space-x-1 py-2.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#00b87c]/20 border border-[#00b87c] text-[#10b981] font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('log-meals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'log-meals'
                ? 'bg-[#00b87c]/20 border border-[#00b87c] text-[#10b981] font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Meals</span>
          </button>

          <button
            onClick={() => setActiveTab('all-meals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all-meals'
                ? 'bg-[#00b87c]/20 border border-[#00b87c] text-[#10b981] font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Meal History</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#00b87c]/20 border border-[#00b87c] text-[#10b981] font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#00b87c]/20 border border-[#00b87c] text-[#10b981] font-bold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};


