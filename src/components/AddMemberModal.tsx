'use client';

import React, { useState } from 'react';
import { X, Sparkles, UserPlus, HelpCircle } from 'lucide-react';
import { CostCategory } from '../types';

import { Language, getTranslation } from '../utils/translations';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CostCategory[];
  language: Language;
  onAddMember: (
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    initialCustomCosts?: { categoryId: string; amount: number }[]
  ) => void;
}

export function AddMemberModal({ isOpen, onClose, categories, language, onAddMember }: AddMemberModalProps) {
  const [name, setName] = useState<string>('');
  const [bazaar, setBazaar] = useState<string>('');
  const [meals, setMeals] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const individualCategories = categories.filter((cat) => cat.splitType === 'INDIVIDUAL');

  // Track inputs for individual categories (like Old Due, Advance Balance, etc.)
  const [customAmounts, setCustomAmounts] = useState<{ [categoryId: string]: string }>(() => {
    const initialAmounts: { [categoryId: string]: string } = {};
    individualCategories.forEach((cat) => {
      initialAmounts[cat.id] = '';
    });
    return initialAmounts;
  });

  if (!isOpen) return null;

  const handleCustomAmountChange = (categoryId: string, value: string) => {
    setCustomAmounts((prev) => ({
      ...prev,
      [categoryId]: value,
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

    const initialCustomCosts = individualCategories.map((cat) => ({
      categoryId: cat.id,
      amount: parseFloat(customAmounts[cat.id]) || 0,
    }));

    onAddMember(name.trim(), bazaarAmount, totalMeals, initialCustomCosts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <UserPlus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              {getTranslation(language, 'addNewMember')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <p className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl text-left">
              {error}
            </p>
          )}

          <div className="text-left">
            <label htmlFor="modal-member-name" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              {getTranslation(language, 'fullName')}
            </label>
            <input
              id="modal-member-name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <label htmlFor="modal-member-bazaar" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
                {getTranslation(language, 'bazaarDepositInput')}
              </label>
              <input
                id="modal-member-bazaar"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={bazaar}
                onChange={(e) => setBazaar(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
              />
            </div>

            <div>
              <label htmlFor="modal-member-meals" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
                {getTranslation(language, 'mealsEatenInput')}
              </label>
              <input
                id="modal-member-meals"
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
              />
            </div>
          </div>

          {/* Individual split category dynamic inputs (like Old Due or Advance Balance) */}
          {individualCategories.length > 0 && (
            <div className="pt-3 border-t border-zinc-150 space-y-3 text-left">
              <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                {getTranslation(language, 'customFeesHeader')}
                <span title="Amounts specific to this member at start">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {individualCategories.map((cat) => (
                  <div key={cat.id}>
                    <label htmlFor={`modal-member-${cat.id}`} className="block text-xs font-bold text-zinc-600 uppercase mb-1 flex items-center justify-between">
                      <span className="truncate">{cat.name}</span>
                      <span className={`text-[9px] px-1 py-0.1 rounded font-black ${cat.type === 'PLUS' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        {cat.type}
                      </span>
                    </label>
                    <div className="relative rounded-xl shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-zinc-400 font-bold text-xs">৳</span>
                      </div>
                      <input
                        id={`modal-member-${cat.id}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={customAmounts[cat.id] || ''}
                        onChange={(e) => handleCustomAmountChange(cat.id, e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-150 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-800 border border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer text-center"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-95 text-center"
            >
              {getTranslation(language, 'addMember')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
