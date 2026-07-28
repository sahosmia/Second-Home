'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Edit, HelpCircle } from 'lucide-react';
import { CostCategory, Member } from '../types';

import { Language, getTranslation } from '../utils/translations';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CostCategory[];
  member: Member;
  language: Language;
  onUpdateMember: (
    id: string,
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    customCosts: { categoryId: string; amount: number }[]
  ) => void;
}

export function EditMemberModal({
  isOpen,
  onClose,
  categories,
  member,
  language,
  onUpdateMember,
}: EditMemberModalProps) {
  const [name, setName] = useState<string>('');
  const [bazaar, setBazaar] = useState<string>('');
  const [meals, setMeals] = useState<string>('');
  const [error, setError] = useState<string>('');

  const cleanNumberInput = (val: string): string => {
    if (!val) return '';
    if (val.startsWith('0') && val.length > 1 && val[1] !== '.') {
      return val.replace(/^0+/, '') || '0';
    }
    return val;
  };

  const individualCategories = useMemo(() => {
    return categories.filter((cat) => cat.splitType === 'INDIVIDUAL');
  }, [categories]);

  // Track inputs for individual categories
  const [customAmounts, setCustomAmounts] = useState<{ [categoryId: string]: string }>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setBazaar(String(member.bazaarAmount ?? '0'));
      setMeals(String(member.totalMeals ?? '0'));

      const initialAmounts: { [categoryId: string]: string } = {};
      individualCategories.forEach((cat) => {
        const costInput = member.customCosts?.find((cc) => cc.categoryId === cat.id);
        initialAmounts[cat.id] = costInput ? String(costInput.amount) : '0';
      });
      setCustomAmounts(initialAmounts);
    }
  }, [member, categories, individualCategories]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleCustomAmountChange = (categoryId: string, value: string) => {
    setCustomAmounts((prev) => ({
      ...prev,
      [categoryId]: cleanNumberInput(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }

    const bazaarAmount = parseFloat(bazaar) || 0;
    const totalMeals = parseFloat(meals) || 0;

    const updatedCustomCosts = individualCategories.map((cat) => ({
      categoryId: cat.id,
      amount: parseFloat(customAmounts[cat.id]) || 0,
    }));

    onUpdateMember(member.id, name.trim(), bazaarAmount, totalMeals, updatedCustomCosts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-850 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Edit className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
              {getTranslation(language, 'editMember')}: {member.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white dark:bg-zinc-950">
          {error && (
            <p className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-left">
              {error}
            </p>
          )}

          <div className="text-left">
            <label htmlFor="edit-member-name" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5">
              {getTranslation(language, 'fullName')}
            </label>
            <input
              id="edit-member-name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label htmlFor="edit-member-bazaar" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5">
                {getTranslation(language, 'bazaarDepositInput')}
              </label>
              <input
                id="edit-member-bazaar"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={bazaar}
                onChange={(e) => setBazaar(cleanNumberInput(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="edit-member-meals" className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5">
                {getTranslation(language, 'mealsEatenInput')}
              </label>
              <input
                id="edit-member-meals"
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={meals}
                onChange={(e) => setMeals(cleanNumberInput(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-medium transition-all"
              />
            </div>
          </div>

          {/* Individual split category dynamic inputs */}
          {individualCategories.length > 0 && (
            <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 space-y-3 text-left">
              <h3 className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                {getTranslation(language, 'customFeesHeader')}
                <span title="Amounts specific to this member">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {individualCategories.map((cat) => (
                  <div key={cat.id} className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-850">
                    <label htmlFor={`edit-member-${cat.id}`} className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase mb-1.5 flex items-center justify-between gap-1">
                      <span className="truncate" title={cat.name}>{cat.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black shrink-0 ${cat.type === 'PLUS' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-400'}`}>
                        {cat.type}
                      </span>
                    </label>
                    <div className="relative rounded-xl shadow-2xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-zinc-400 dark:text-zinc-500 font-bold text-xs">৳</span>
                      </div>
                      <input
                        id={`edit-member-${cat.id}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={customAmounts[cat.id] || ''}
                        onChange={(e) => handleCustomAmountChange(cat.id, e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-900 font-bold transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-150 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer text-center"
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
