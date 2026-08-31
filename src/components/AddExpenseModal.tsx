'use client';

import React, { useState } from 'react';
import { X, HelpCircle, PlusCircle, Settings, Users } from 'lucide-react';
import { CostCategory, CostType, SplitType, Member } from '../types';

import { Language, getTranslation } from '../utils/translations';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CostCategory[];
  members: Member[];
  language: Language;
  onAddExpense: (
    category: Omit<CostCategory, 'id'>,
    initialMemberAmounts?: { [memberId: string]: number }
  ) => void;
}

import { ExpenseOccurrence } from '../types';

export function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  members,
  language,
  onAddExpense,
}: AddExpenseModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CostType>('PLUS');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [occurrence, setOccurrence] = useState<ExpenseOccurrence>('REGULAR');
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const [lumpSum, setLumpSum] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const cleanNumberInput = (val: string): string => {
    if (!val) return '';
    if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
      return val.replace(/^0+/, '') || '0';
    }
    return val;
  };

  // Track initial amounts for each member if splitType is INDIVIDUAL
  const [memberAmounts, setMemberAmounts] = useState<{ [memberId: string]: string }>(() => {
    const initialAmounts: { [memberId: string]: string } = {};
    members.forEach((m) => {
      initialAmounts[m.id] = '';
    });
    return initialAmounts;
  });

  if (!isOpen) return null;

  const handleMemberAmountChange = (memberId: string, value: string) => {
    setMemberAmounts((prev) => ({
      ...prev,
      [memberId]: cleanNumberInput(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    const trimmedName = name.trim();
    if (categories.some((cat) => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }

    const finalLumpSum = splitType === 'EQUAL' ? parseFloat(lumpSum) || 0 : undefined;

    const initialAmounts: { [memberId: string]: number } = {};
    if (splitType === 'INDIVIDUAL') {
      members.forEach((m) => {
        initialAmounts[m.id] = parseFloat(memberAmounts[m.id]) || 0;
      });
    }

    onAddExpense({
      name: trimmedName,
      type,
      splitType,
      totalLumpSum: finalLumpSum,
      occurrence,
      isFixed: occurrence === 'REGULAR' ? isFixed : false,
      note: note.trim() ? note.trim() : undefined,
    }, initialAmounts);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100">{getTranslation(language, 'addCustomCategory')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white dark:bg-zinc-950">
          {error && (
            <p className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-left">
              {error}
            </p>
          )}

          <div className="text-left">
            <label htmlFor="modal-cat-name" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5">
              {getTranslation(language, 'categoryName')}
            </label>
            <input
              id="modal-cat-name"
              type="text"
              placeholder="e.g. WiFi Bill, Room Rent, Gas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1">
                {getTranslation(language, 'occurrenceLabel')}
              </label>
              <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setOccurrence('REGULAR')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    occurrence === 'REGULAR'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'occurrenceRegular').split(' ')[0]}
                </button>
                <button
                  type="button"
                  onClick={() => setOccurrence('ONE_TIME')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    occurrence === 'ONE_TIME'
                      ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'occurrenceOneTime').split(' ')[0]}
                </button>
              </div>
            </div>

            {occurrence === 'REGULAR' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1">
                  {getTranslation(language, 'resetBehaviorLabel')}
                </label>
                <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIsFixed(true)}
                    className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                      isFixed
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {language === 'bn' ? 'স্থায়ী' : 'Fixed'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFixed(false)}
                    className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                      !isFixed
                        ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {language === 'bn' ? 'পরিবর্তনশীল' : 'Variable'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1" title="PLUS (+): Added to member costs. MINUS (-): Subtracted from member costs.">
                {getTranslation(language, 'categoryType')}
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setType('PLUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'PLUS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'plusShort')}
                </button>
                <button
                  type="button"
                  onClick={() => setType('MINUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'MINUS'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'minusShort')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center gap-1" title="EQUAL: Divided evenly among all members. INDIVIDUAL: Input custom value for each member.">
                {getTranslation(language, 'splitTypeLabel')}
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'EQUAL'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'equalSplitLabel')}
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('INDIVIDUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'INDIVIDUAL'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {getTranslation(language, 'individualSplitLabel')}
                </button>
              </div>
            </div>
          </div>

          {splitType === 'EQUAL' && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl animate-in slide-in-from-top-1 duration-150 text-left">
              <label htmlFor="modal-lump-sum" className="block text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1.5">
                {getTranslation(language, 'defaultLumpSum')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">৳</span>
                </div>
                <input
                  id="modal-lump-sum"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(cleanNumberInput(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-950 dark:text-emerald-100 font-bold text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 leading-relaxed">
                Will auto-divide equally across all <strong>{members.length}</strong> current member{members.length !== 1 ? 's' : ''} (<strong>৳{members.length > 0 ? ((parseFloat(lumpSum) || 0) / members.length).toFixed(2) : '0.00'}</strong> each).
              </p>
            </div>
          )}

          {splitType === 'INDIVIDUAL' && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in slide-in-from-top-1 duration-150 text-left">
              <h3 className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {getTranslation(language, 'initialIndividualValues')}
              </h3>

              {members.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No members currently added to allocate dues to.</p>
              ) : (
                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 truncate">{m.name}</span>
                      <div className="relative rounded-lg shadow-xs w-28 shrink-0">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <span className="text-zinc-400 dark:text-zinc-500 font-bold text-[10px]">৳</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0.00"
                          value={memberAmounts[m.id] || ''}
                          onChange={(e) => handleMemberAmountChange(m.id, e.target.value)}
                          className="w-full pl-6 pr-2.5 py-1 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-zinc-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-left pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <label htmlFor="modal-cat-note" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5">
              {getTranslation(language, 'noteLabel')}
            </label>
            <textarea
              id="modal-cat-note"
              rows={2}
              placeholder={getTranslation(language, 'notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-medium transition-all resize-none"
            />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
              {getTranslation(language, 'noteHelper')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer text-center"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-95 text-center"
            >
              <PlusCircle className="w-4 h-4" />
              {getTranslation(language, 'addCategory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
