'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit, HelpCircle } from 'lucide-react';
import { CostCategory, CostType, SplitType } from '../types';
import { Language, getTranslation } from '../utils/translations';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CostCategory;
  language: Language;
  onUpdateExpense: (
    id: string,
    name: string,
    type: CostType,
    splitType: SplitType,
    totalLumpSum?: number
  ) => void;
}

export function EditExpenseModal({
  isOpen,
  onClose,
  category,
  language,
  onUpdateExpense,
}: EditExpenseModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CostType>('PLUS');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [lumpSum, setLumpSum] = useState<string>('');
  const [error, setError] = useState<string>('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setType(category.type || 'PLUS');
      setSplitType(category.splitType || 'EQUAL');
      setLumpSum(category.totalLumpSum !== undefined ? String(category.totalLumpSum) : '');
    }
  }, [category]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Expense name is required.');
      return;
    }

    const finalLumpSum = splitType === 'EQUAL' ? parseFloat(lumpSum) || 0 : undefined;

    onUpdateExpense(category.id, name.trim(), type, splitType, finalLumpSum);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Edit className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-800">
              {getTranslation(language, 'editMember').replace('Member', 'Expense')}: {category.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <p className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-left">
              {error}
            </p>
          )}

          <div className="text-left">
            <label htmlFor="edit-cat-name" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              {getTranslation(language, 'categoryName')}
            </label>
            <input
              id="edit-cat-name"
              type="text"
              placeholder="e.g. WiFi Bill, Room Rent, Gas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-350 rounded-xl text-zinc-855 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-1" title="PLUS (+): Added to member costs. MINUS (-): Subtracted from member costs.">
                {getTranslation(language, 'categoryType')}
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setType('PLUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'PLUS'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  PLUS
                </button>
                <button
                  type="button"
                  onClick={() => setType('MINUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'MINUS'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  MINUS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-1" title="EQUAL: Divided evenly among all members. INDIVIDUAL: Input custom value for each member.">
                {getTranslation(language, 'splitTypeLabel')}
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'EQUAL'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  EQUAL
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('INDIVIDUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'INDIVIDUAL'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  INDIV
                </button>
              </div>
            </div>
          </div>

          {splitType === 'EQUAL' && (
            <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-1 duration-150 text-left">
              <label htmlFor="edit-lump-sum" className="block text-xs font-bold text-emerald-800 uppercase mb-1.5">
                {getTranslation(language, 'defaultLumpSum')}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-emerald-600 font-bold text-sm">৳</span>
                </div>
                <input
                  id="edit-lump-sum"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-emerald-200 rounded-xl text-emerald-955 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-150 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-855 border border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer text-center"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-95 text-center"
            >
              <Save className="w-4 h-4" />
              {getTranslation(language, 'saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
