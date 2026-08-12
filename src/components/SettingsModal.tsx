import React, { useState } from 'react';
import { AppData, AppSettings } from '../types';
import {
  Settings,
  IndianRupee,
  Download,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  appData: AppData;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onImportBackup: (importedData: AppData) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  appData,
  onUpdateSettings,
  onImportBackup,
  onResetSampleData,
  onClearAllData,
}) => {
  const [price, setPrice] = useState<number>(appData.settings.pricePerMeal || 50);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handlePriceSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (price <= 0) return;

    onUpdateSettings({ pricePerMeal: price });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `meal_tracker_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.persons) && parsed.settings) {
          onImportBackup(parsed);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
          SYSTEM CONFIGURATION
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#00b87c]" />
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Configure meal pricing, local storage persistence, export backups, or manage app state
        </p>
      </div>

      {/* Local Storage Persistence Status Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Local Storage Active</h4>
            <p className="text-slate-600 font-medium text-xs mt-0.5">
              All your meal entries, members, and payment receipts are automatically saved directly in your browser's local memory (<code className="bg-emerald-100/80 text-emerald-900 px-1 py-0.5 rounded font-mono">localStorage</code>). Your data will stay safe even when you close or reload the app.
            </p>
          </div>
        </div>
        <span className="bg-[#00b87c] text-white font-extrabold px-3 py-1 rounded-full text-[11px] whitespace-nowrap self-start sm:self-center">
          PERSISTENCE ACTIVE
        </span>
      </div>

      {/* 1. Meal Pricing Configuration Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Meal Pricing Rate</h3>
            <p className="text-xs text-slate-500 font-medium">
              Set the standard cost per meal slot (applies to all new entries)
            </p>
          </div>
        </div>

        <form onSubmit={handlePriceSave} className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Price per Meal (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:border-[#00b87c]"
              />
            </div>
          </div>

          {/* Live Price Calculator Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              <Info className="w-4 h-4 text-slate-400" />
              Live Rate Calculation:
            </span>
            <div className="font-mono font-bold space-x-3 text-xs">
              <span className="text-slate-700">1 meal = ₹{price}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#00b87c]">3 meals = ₹{price * 3}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Meal Price</span>
            </button>

            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 2. Data Backup & Restore Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#00b87c] text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Data Backup & Restore</h3>
            <p className="text-xs text-slate-500 font-medium">
              Download your full database as a JSON file or import a saved backup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Export Database Backup</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Saves all persons, meal records, and payment receipts to a local JSON file.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center justify-center gap-2 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer w-full"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Export Backup (.JSON)</span>
            </button>
          </div>

          {/* Import */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Restore from Backup</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Select a previously exported JSON backup file to overwrite current app data.
              </p>
            </div>
            <label className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer w-full shadow-2xs">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Restore Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Reset or Clear Data Options Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Management & Reset Options</h3>
            <p className="text-xs text-slate-500 font-medium">
              Start fresh for your actual daily household usage or restore initial demo data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Clear All Data (Start Fresh)</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Removes sample members (Irfan, Vishnu, Abhi) and all sample records so you can add your own real household or mess members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data and start completely fresh for your real daily use?')) {
                  onClearAllData();
                }
              }}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer w-full"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Start Fresh (Clear Sample Data)</span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Reset to Demo Sample Data</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Restores the standard sample dataset with demo accounts and sample meal logs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to the default sample dataset?')) {
                  onResetSampleData();
                }
              }}
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer w-full"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reset to Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

