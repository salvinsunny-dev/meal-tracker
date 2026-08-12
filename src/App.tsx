import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppData,
  Person,
  MealRecord,
  BillingCycle,
  PaymentReceipt,
  AppSettings,
  NavTab,
  ToastMessage,
} from './types';
import {
  fetchAppData,
  saveAppData,
  resetAppDataToServer,
  clearAppDataToEmpty,
  calculatePersonBalance,
  POLL_INTERVAL_MS,
} from './lib/trackerStore';
import { INITIAL_DATA, getTodayStr } from './data/initialData';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AddPersonModal } from './components/AddPersonModal';
import { MealEntryModal } from './components/MealEntryModal';
import { PaymentConfirmModal } from './components/PaymentConfirmModal';
import { PersonDetailsModal } from './components/PersonDetailsModal';
import { AllMealsHistory } from './components/AllMealsHistory';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal States
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isMealEntryOpen, setIsMealEntryOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isPersonDetailsOpen, setIsPersonDetailsOpen] = useState(false);

  // Selected Entities for Modals
  const [selectedPersonForDetails, setSelectedPersonForDetails] = useState<Person | null>(null);
  const [selectedPersonForPayment, setSelectedPersonForPayment] = useState<Person | null>(null);
  const [preselectedPersonIdForMeal, setPreselectedPersonIdForMeal] = useState<string | undefined>(undefined);
  const [preselectedDateForMeal, setPreselectedDateForMeal] = useState<string | undefined>(undefined);

  // Track whether a save is in-flight so polling doesn't overwrite optimistic UI
  const isSaving = useRef(false);

  // Load Initial App Data
  useEffect(() => {
    fetchAppData().then(data => {
      // If API is unreachable on first load, fall back to INITIAL_DATA so the
      // UI at least renders something meaningful instead of spinning forever.
      setAppData(data ?? INITIAL_DATA);
    });
  }, []);

  // ── Real-time polling ───────────────────────────────────────────────────────
  // Poll MongoDB every POLL_INTERVAL_MS so all open tabs and devices stay in sync.
  // We only update if we get a real response (non-null) to avoid overwriting
  // optimistic UI with stale fallback data when the API is temporarily unreachable.
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isSaving.current) return;
      const fresh = await fetchAppData();
      if (fresh) setAppData(fresh); // only update on a real server response
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateAndSaveAppData = async (newData: AppData) => {
    // Optimistically update the UI immediately
    setAppData(newData);
    // Block polling while the save is in-flight
    isSaving.current = true;
    const ok = await saveAppData(newData);
    isSaving.current = false;
    if (!ok) {
      addToast('Could not save — API server unreachable. Run: npm run dev:api', 'error');
    }
  };

  if (!appData) {
    return (
      <div className="min-h-screen bg-[#0c1322] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00b87c] border-t-transparent animate-spin rounded-full" />
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">Loading Meal & Payment Ledger...</span>
        </div>
      </div>
    );
  }

  // Calculated Metrics for Header
  const totalPersons = appData.persons.length;
  const pricePerMeal = appData.settings.pricePerMeal || 50;
  const totalUnpaidDues = appData.persons.reduce((sum, p) => {
    const bal = calculatePersonBalance(p, appData);
    return sum + bal.amountDue;
  }, 0);

  // Handlers
  const handleAddPerson = (newPerson: Person, newCycle: BillingCycle) => {
    const updated: AppData = {
      ...appData,
      persons: [...appData.persons, newPerson],
      billingCycles: [...appData.billingCycles, newCycle],
    };

    updateAndSaveAppData(updated);
    addToast(`Added person account for ${newPerson.name}`, 'success');
  };

  const handleRemovePerson = (person: Person) => {
    if (!confirm(`Are you sure you want to delete ${person.name} and all associated records?`)) {
      return;
    }

    const updated: AppData = {
      ...appData,
      persons: appData.persons.filter(p => p.id !== person.id),
      billingCycles: appData.billingCycles.filter(c => c.personId !== person.id),
      mealRecords: appData.mealRecords.filter(r => r.personId !== person.id),
      paymentReceipts: appData.paymentReceipts.filter(pr => pr.personId !== person.id),
    };

    updateAndSaveAppData(updated);
    addToast(`Removed ${person.name}`, 'info');

    if (selectedPersonForDetails?.id === person.id) {
      setIsPersonDetailsOpen(false);
      setSelectedPersonForDetails(null);
    }
  };

  const handleQuickUpdateMeal = (
    personId: string,
    slot: 'morning' | 'afternoon' | 'night',
    delta: number
  ) => {
    const today = getTodayStr();
    const person = appData.persons.find(p => p.id === personId);
    if (!person) return;

    const existingRecord = appData.mealRecords.find(
      r => r.personId === personId && r.date === today
    );

    let updatedMealRecords: MealRecord[] = [];

    if (existingRecord) {
      const currentSlotValue = existingRecord.meals[slot] || 0;
      const newSlotValue = Math.max(0, currentSlotValue + delta);

      const newMeals = {
        ...existingRecord.meals,
        [slot]: newSlotValue,
      };

      const totalMeals = newMeals.morning + newMeals.afternoon + newMeals.night;
      const totalCost = totalMeals * (existingRecord.pricePerMeal || pricePerMeal);

      const updatedRecord: MealRecord = {
        ...existingRecord,
        meals: newMeals,
        totalMeals,
        totalCost,
        updatedAt: new Date().toISOString(),
      };

      updatedMealRecords = appData.mealRecords.map(r =>
        r.id === existingRecord.id ? updatedRecord : r
      );
    } else {
      // Create new record
      if (delta <= 0) return; // Cannot decrease from 0

      const newMeals = {
        morning: slot === 'morning' ? delta : 0,
        afternoon: slot === 'afternoon' ? delta : 0,
        night: slot === 'night' ? delta : 0,
      };

      const totalMeals = newMeals.morning + newMeals.afternoon + newMeals.night;
      const totalCost = totalMeals * pricePerMeal;

      const newRecord: MealRecord = {
        id: `mr-${Date.now()}-${Math.random()}`,
        personId,
        cycleId: person.activeCycleId,
        date: today,
        meals: newMeals,
        pricePerMeal,
        totalMeals,
        totalCost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      updatedMealRecords = [...appData.mealRecords, newRecord];
    }

    const updatedAppData: AppData = {
      ...appData,
      mealRecords: updatedMealRecords,
    };

    updateAndSaveAppData(updatedAppData);
    addToast(`Updated today's ${slot} meal for ${person.name}`, 'success');
  };

  const handleSaveMealEntry = (
    mealData: Omit<MealRecord, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    let updatedRecords: MealRecord[] = [];

    if (existingId) {
      const existing = appData.mealRecords.find(r => r.id === existingId);
      const updatedRecord: MealRecord = {
        ...mealData,
        id: existingId,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedRecords = appData.mealRecords.map(r => (r.id === existingId ? updatedRecord : r));
    } else {
      const newRecord: MealRecord = {
        ...mealData,
        id: `mr-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedRecords = [...appData.mealRecords, newRecord];
    }

    const updated: AppData = {
      ...appData,
      mealRecords: updatedRecords,
    };

    updateAndSaveAppData(updated);
    const person = appData.persons.find(p => p.id === mealData.personId);
    addToast(`Saved meal record for ${person?.name || 'person'}`, 'success');
  };

  const handleDeleteMealRecord = (recordId: string) => {
    const updated: AppData = {
      ...appData,
      mealRecords: appData.mealRecords.filter(r => r.id !== recordId),
    };

    updateAndSaveAppData(updated);
    addToast('Deleted meal record', 'info');
  };

  const handleConfirmPayment = (
    person: Person,
    settledMeals: number,
    settledAmount: number,
    note: string
  ) => {
    const today = getTodayStr();
    const activeCycle = appData.billingCycles.find(c => c.id === person.activeCycleId);
    const currentCycleNumber = activeCycle ? activeCycle.cycleNumber : 1;

    // 1. Close current cycle
    const updatedCycles: BillingCycle[] = appData.billingCycles.map(c => {
      if (c.id === person.activeCycleId) {
        return {
          ...c,
          endDate: today,
          status: 'PAID' as const,
        };
      }
      return c;
    });

    // 2. Create new active cycle
    const newCycleId = `cycle-${person.id}-${currentCycleNumber + 1}`;
    const newCycle: BillingCycle = {
      id: newCycleId,
      personId: person.id,
      cycleNumber: currentCycleNumber + 1,
      startDate: today,
      status: 'ACTIVE',
    };
    updatedCycles.push(newCycle);

    // 3. Update Person active cycle pointer
    const updatedPersons: Person[] = appData.persons.map(p => {
      if (p.id === person.id) {
        return {
          ...p,
          activeCycleId: newCycleId,
        };
      }
      return p;
    });

    // 4. Create Payment Receipt
    const newReceipt: PaymentReceipt = {
      id: `pr-${Date.now()}`,
      personId: person.id,
      personName: person.name,
      cycleId: activeCycle?.id || person.activeCycleId,
      cycleNumber: currentCycleNumber,
      paymentDate: today,
      mealsPaid: settledMeals,
      amountPaid: settledAmount,
      note,
      createdAt: new Date().toISOString(),
    };

    const updatedAppData: AppData = {
      ...appData,
      persons: updatedPersons,
      billingCycles: updatedCycles,
      paymentReceipts: [...appData.paymentReceipts, newReceipt],
    };

    updateAndSaveAppData(updatedAppData);
    addToast(`Confirmed payment of ₹${settledAmount} for ${person.name}. Cycle reset!`, 'success');
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    const updated: AppData = {
      ...appData,
      settings: newSettings,
    };
    updateAndSaveAppData(updated);
    addToast(`Updated meal price rate to ₹${newSettings.pricePerMeal}`, 'success');
  };

  const handleImportBackup = (importedData: AppData) => {
    updateAndSaveAppData(importedData);
    addToast('Restored backup successfully!', 'success');
  };

  const handleResetSampleData = async () => {
    const resetData = await resetAppDataToServer();
    setAppData(resetData);
    addToast('Reset to default sample dataset', 'info');
  };

  const handleClearAllData = async () => {
    const emptyData = await clearAppDataToEmpty();
    setAppData(emptyData);
    addToast('Cleared sample data. Ready for fresh usage!', 'success');
  };

  // Open Handlers
  const handleOpenRecordMeal = (person?: Person, date?: string) => {
    setPreselectedPersonIdForMeal(person?.id);
    setPreselectedDateForMeal(date);
    setIsMealEntryOpen(true);
  };

  const handleOpenPaidAndReset = (person: Person) => {
    setSelectedPersonForPayment(person);
    setIsPaymentConfirmOpen(true);
  };

  const handleOpenDetails = (person: Person) => {
    setSelectedPersonForDetails(person);
    setIsPersonDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0c1322] text-slate-100 font-sans selection:bg-[#00b87c] selection:text-white flex flex-col">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pricePerMeal={pricePerMeal}
        totalPersons={totalPersons}
        totalUnpaidDues={totalUnpaidDues}
        onOpenRecordMeal={() => handleOpenRecordMeal()}
        onOpenAddPerson={() => setIsAddPersonOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            appData={appData}
            onViewDetails={handleOpenDetails}
            onPaidAndReset={handleOpenPaidAndReset}
            onRemovePerson={handleRemovePerson}
            onEditTodayMeal={p => handleOpenRecordMeal(p, getTodayStr())}
            onQuickUpdateMeal={handleQuickUpdateMeal}
            onOpenAddPerson={() => setIsAddPersonOpen(true)}
            onOpenRecordMeal={() => handleOpenRecordMeal()}
          />
        )}

        {activeTab === 'log-meals' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">ENTRY PROMPT</span>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Record & Edit Meal Entries</h2>
              <p className="text-xs text-slate-500 font-medium mb-5">
                Log breakfast, lunch, or dinner for any person and date.
              </p>
              <button
                onClick={() => handleOpenRecordMeal()}
                className="bg-[#00b87c] text-white hover:bg-[#00a36d] font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                Open Meal Entry Dialog
              </button>
            </div>
            <AllMealsHistory
              appData={appData}
              onOpenRecordMeal={handleOpenRecordMeal}
              onDeleteMealRecord={handleDeleteMealRecord}
            />
          </div>
        )}

        {activeTab === 'all-meals' && (
          <AllMealsHistory
            appData={appData}
            onOpenRecordMeal={handleOpenRecordMeal}
            onDeleteMealRecord={handleDeleteMealRecord}
          />
        )}

        {activeTab === 'payments' && <PaymentHistoryView appData={appData} />}

        {activeTab === 'settings' && (
          <SettingsModal
            appData={appData}
            onUpdateSettings={handleUpdateSettings}
            onImportBackup={handleImportBackup}
            onResetSampleData={handleResetSampleData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 bg-[#0c1322]">
        <p className="font-semibold tracking-wider uppercase text-[10px]">Meal & Payment Tracker • Shared Household Ledger</p>
      </footer>

      {/* Modals & Dialogs */}
      <AddPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        appData={appData}
        onPersonAdded={handleAddPerson}
      />

      <MealEntryModal
        isOpen={isMealEntryOpen}
        onClose={() => setIsMealEntryOpen(false)}
        appData={appData}
        preselectedPersonId={preselectedPersonIdForMeal}
        preselectedDate={preselectedDateForMeal}
        onSaveMeal={handleSaveMealEntry}
      />

      <PaymentConfirmModal
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        person={selectedPersonForPayment}
        appData={appData}
        onConfirmPayment={handleConfirmPayment}
      />

      <PersonDetailsModal
        isOpen={isPersonDetailsOpen}
        onClose={() => setIsPersonDetailsOpen(false)}
        person={selectedPersonForDetails}
        appData={appData}
        onOpenRecordMealForPerson={(person, date) => {
          handleOpenRecordMeal(person, date);
        }}
        onPaidAndReset={p => {
          handleOpenPaidAndReset(p);
        }}
        onDeleteMealRecord={handleDeleteMealRecord}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
