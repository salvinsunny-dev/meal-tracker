import React, { useState } from 'react';
import { Person, AppData } from '../types';
import { PersonCard } from './PersonCard';
import { calculatePersonBalance } from '../lib/trackerStore';
import { Search, PlusCircle, Users, UtensilsCrossed } from 'lucide-react';

interface DashboardProps {
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
  onOpenAddPerson: () => void;
  onOpenRecordMeal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  appData,
  onViewDetails,
  onPaidAndReset,
  onRemovePerson,
  onEditTodayMeal,
  onQuickUpdateMeal,
  onOpenAddPerson,
  onOpenRecordMeal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersons = appData.persons.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="space-y-6">
      {/* Top Search & Account Stats Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search person by name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00b87c] focus:bg-white transition-all"
          />
        </div>

        {/* Counter Info */}
        <div className="text-xs text-slate-500 font-medium text-right sm:text-left px-2 sm:px-0">
          Showing <span className="font-bold text-slate-800">{filteredPersons.length}</span> of{' '}
          <span className="font-bold text-slate-800">{appData.persons.length}</span> accounts
        </div>
      </div>

      {/* Grid of Person Cards */}
      {filteredPersons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersons.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              appData={appData}
              onViewDetails={onViewDetails}
              onPaidAndReset={onPaidAndReset}
              onRemovePerson={onRemovePerson}
              onEditTodayMeal={onEditTodayMeal}
              onQuickUpdateMeal={onQuickUpdateMeal}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchTerm ? 'No matching persons found' : 'No persons registered yet'}
          </h3>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            {searchTerm
              ? `No person matched "${searchTerm}". Try searching a different name.`
              : 'Add your housemates or friends to start tracking meals and dues.'}
          </p>

          {!searchTerm ? (
            <button
              onClick={onOpenAddPerson}
              className="inline-flex items-center gap-2 bg-[#00b87c] hover:bg-[#00a36d] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add First Person</span>
            </button>
          ) : (
            <button
              onClick={() => setSearchTerm('')}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

