'use client';

import React, { useState } from 'react';
import { X, HelpCircle, PlusCircle, Settings } from 'lucide-react';
import { CostCategory, CostType, SplitType } from '../types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CostCategory[];
  memberCount: number;
  onAddCategory: (category: Omit<CostCategory, 'id'>) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  categories,
  memberCount,
  onAddCategory,
}: AddCategoryModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CostType>('PLUS');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [lumpSum, setLumpSum] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

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

    onAddCategory({
      name: trimmedName,
      type,
      splitType,
      totalLumpSum: finalLumpSum,
    });

    // Reset fields & close
    setName('');
    setLumpSum('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-zinc-800">Add Custom Category</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="modal-cat-name" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              Category Name
            </label>
            <input
              id="modal-cat-name"
              type="text"
              placeholder="e.g. WiFi Bill, Room Rent, Gas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-zinc-850 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-1" title="PLUS (+): Added to member costs. MINUS (-): Subtracted from member costs.">
                Type
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('PLUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'PLUS'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  PLUS
                </button>
                <button
                  type="button"
                  onClick={() => setType('MINUS')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'MINUS'
                      ? 'bg-rose-550 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  MINUS
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 uppercase mb-1.5 flex items-center gap-1" title="EQUAL: Divided evenly among all members. INDIVIDUAL: Input custom value for each member.">
                Split
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-200 p-0.5 bg-zinc-50 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'EQUAL'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  EQUAL
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('INDIVIDUAL')}
                  className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'INDIVIDUAL'
                      ? 'bg-zinc-800 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  INDIV
                </button>
              </div>
            </div>
          </div>

          {splitType === 'EQUAL' && (
            <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-1 duration-150">
              <label htmlFor="modal-lump-sum" className="block text-xs font-bold text-emerald-800 uppercase mb-1.5">
                Total Lump Sum Amount ($)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-emerald-600 font-bold text-sm">$</span>
                </div>
                <input
                  id="modal-lump-sum"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-emerald-200 rounded-xl text-emerald-950 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-2 leading-relaxed">
                Will auto-divide equally across all <strong>{memberCount}</strong> current member{memberCount !== 1 ? 's' : ''} (<strong>${memberCount > 0 ? ((parseFloat(lumpSum) || 0) / memberCount).toFixed(2) : '0.00'}</strong> each).
              </p>
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-850 border border-zinc-300 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
