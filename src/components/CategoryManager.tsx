'use client';

import React, { useState } from 'react';
import { CostCategory, CostType, SplitType } from '../types';
import { PlusCircle, Trash, Settings, DollarSign, HelpCircle } from 'lucide-react';

interface CategoryManagerProps {
  categories: CostCategory[];
  memberCount: number;
  onAddCategory: (category: Omit<CostCategory, 'id'>) => void;
  onRemoveCategory: (id: string) => void;
  onUpdateLumpSum: (id: string, lumpSum: number) => void;
}

export function CategoryManager({
  categories,
  memberCount,
  onAddCategory,
  onRemoveCategory,
  onUpdateLumpSum,
}: CategoryManagerProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<CostType>('PLUS');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [lumpSum, setLumpSum] = useState<string>('');

  const [error, setError] = useState<string>('');

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

    // Reset Form Fields
    setName('');
    setLumpSum('');
    setError('');
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Panel Header */}
      <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-zinc-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-800">Dynamic Category Management</h2>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold bg-zinc-200/70 text-zinc-700 px-3 py-1 rounded-full">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Category Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase">Add Custom Category</h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="category-name" className="block text-xs font-bold text-zinc-700 uppercase mb-1.5">
              Category Name
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="e.g. Electricity, Room Rent, Gas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-350 rounded-xl text-zinc-850 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-400 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1" title="PLUS (+): Added to member costs. MINUS (-): Subtracted from member costs.">
                Adjustment Type
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-300 p-0.5 bg-zinc-100 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setType('PLUS')}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'PLUS'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  PLUS (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType('MINUS')}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                    type === 'MINUS'
                      ? 'bg-rose-550 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  MINUS (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase mb-1.5 flex items-center gap-1" title="EQUAL: Divided evenly among all members. INDIVIDUAL: Input custom value for each member.">
                Split Type
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              </label>
              <div className="flex rounded-xl border border-zinc-300 p-0.5 bg-zinc-100 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'EQUAL'
                      ? 'bg-zinc-850 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  EQUAL
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('INDIVIDUAL')}
                  className={`flex-1 py-1.5 text-center rounded-lg transition-all cursor-pointer ${
                    splitType === 'INDIVIDUAL'
                      ? 'bg-zinc-850 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  INDIVIDUAL
                </button>
              </div>
            </div>
          </div>

          {splitType === 'EQUAL' && (
            <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-1 duration-150">
              <label htmlFor="lump-sum" className="block text-xs font-bold text-emerald-800 uppercase mb-1.5">
                Total Lump Sum Amount
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-emerald-600 font-bold text-sm">$</span>
                </div>
                <input
                  id="lump-sum"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-emerald-200 rounded-xl text-emerald-950 font-bold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <p className="text-[11px] text-emerald-700 mt-2 leading-relaxed">
                Will auto-divide equally across all <strong>{memberCount}</strong> current member{memberCount !== 1 ? 's' : ''} (<strong>${memberCount > 0 ? ((parseFloat(lumpSum) || 0) / memberCount).toFixed(2) : '0.00'}</strong> each).
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/10 transition-all cursor-pointer active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            Add Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <h3 className="text-xs font-extrabold text-zinc-400 tracking-wider uppercase mb-4">Current Active Categories</h3>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-8 text-center text-zinc-400">
              <DollarSign className="w-12 h-12 mb-3 stroke-1 text-zinc-300" />
              <p className="text-sm font-semibold text-zinc-700">No Custom Adjustments Yet</p>
              <p className="text-xs max-w-xs mt-1 leading-relaxed">Add room rents, WiFi, electric bills, or old dues here to split automatically or manage individually.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isPlus = cat.type === 'PLUS';
                const isEqual = cat.splitType === 'EQUAL';
                const shareAmount = isEqual && memberCount > 0 ? (cat.totalLumpSum || 0) / memberCount : 0;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-200 rounded-2xl bg-zinc-50/50 hover:bg-zinc-50 transition-all gap-4 shadow-2xs hover:shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            isPlus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'
                          }`}
                        />
                        <h4 className="font-extrabold text-zinc-800 text-sm leading-tight">{cat.name}</h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPlus
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cat.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        <span>Split Mode: <strong className="text-zinc-700">{cat.splitType}</strong></span>
                        {isEqual && (
                          <span className="inline-flex items-center gap-1 bg-zinc-200/50 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            Auto Splitting
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-200">
                      {isEqual && (
                        <div className="text-left sm:text-right">
                          <label className="block text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                            Lump Sum Total
                          </label>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-bold text-zinc-400">$</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={cat.totalLumpSum ?? 0}
                              onChange={(e) => onUpdateLumpSum(cat.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-0.5 border border-zinc-300 rounded-lg text-xs font-bold text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="text-[10px] text-zinc-500 font-semibold">(${shareAmount.toFixed(2)} ea)</span>
                          </div>
                        </div>
                      )}

                      {!isEqual && (
                        <div className="text-right">
                          <span className="text-[10px] bg-zinc-200/60 text-zinc-700 px-2 py-1 rounded-md font-bold tracking-tight">
                            Per-Member Custom Amount
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveCategory(cat.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer self-end sm:self-auto"
                        title="Delete category"
                      >
                        <Trash className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
