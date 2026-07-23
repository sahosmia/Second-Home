'use client';

import React, { useState } from 'react';
import { CostCategory, CostType, SplitType } from '../types';
import { PlusCircle, Trash, Settings, DollarSign, RefreshCw } from 'lucide-react';

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
      <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-zinc-500" />
          <h2 className="text-lg font-bold text-zinc-800">Dynamic Category Management</h2>
        </div>
        <span className="text-xs font-semibold bg-zinc-200/60 text-zinc-600 px-2.5 py-1 rounded-full">
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-700 tracking-wide uppercase">Add Custom Category</h3>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg font-medium animate-shake">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="category-name" className="block text-sm font-semibold text-zinc-600 mb-1.5">
              Category Name
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="e.g. WiFi Bill, Electricity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-300 rounded-lg text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Adjustment Type
              </label>
              <div className="flex rounded-lg border border-zinc-300 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setType('PLUS')}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    type === 'PLUS'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  PLUS (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType('MINUS')}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    type === 'MINUS'
                      ? 'bg-rose-500 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  MINUS (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Split Type
              </label>
              <div className="flex rounded-lg border border-zinc-300 overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setSplitType('EQUAL')}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    splitType === 'EQUAL'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  EQUAL
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('INDIVIDUAL')}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    splitType === 'INDIVIDUAL'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  INDIVIDUAL
                </button>
              </div>
            </div>
          </div>

          {splitType === 'EQUAL' && (
            <div className="bg-zinc-50 p-3.5 border border-zinc-200 rounded-lg animate-in slide-in-from-top-1 duration-150">
              <label htmlFor="lump-sum" className="block text-sm font-semibold text-zinc-600 mb-1.5">
                Total Lump Sum Amount
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-zinc-500 sm:text-sm">$</span>
                </div>
                <input
                  id="lump-sum"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-zinc-300 rounded-lg text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                This total will be divided equally among all <strong>{memberCount}</strong> current member{memberCount !== 1 ? 's' : ''} ({memberCount > 0 ? (parseFloat(lumpSum) || 0) / memberCount : 0} each).
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <h3 className="text-sm font-semibold text-zinc-700 tracking-wide uppercase mb-4">Current Active Categories</h3>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center text-zinc-400">
              <DollarSign className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
              <p className="text-sm font-medium">No custom adjustments defined yet.</p>
              <p className="text-xs">Add a category on the left to start adding custom expenses or deductions.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isPlus = cat.type === 'PLUS';
                const isEqual = cat.splitType === 'EQUAL';
                const shareAmount = isEqual && memberCount > 0 ? (cat.totalLumpSum || 0) / memberCount : 0;

                return (
                  <div
                    key={cat.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-zinc-150 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            isPlus ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <h4 className="font-bold text-zinc-800 text-sm">{cat.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                            isPlus
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cat.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>Split: <strong>{cat.splitType}</strong></span>
                        {isEqual && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-zinc-400 animate-spin-slow" />
                            Auto Split
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      {isEqual && (
                        <div className="text-right">
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase">
                            Lump Sum Total
                          </label>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-semibold text-zinc-500">$</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={cat.totalLumpSum ?? 0}
                              onChange={(e) => onUpdateLumpSum(cat.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-1 py-0.5 border border-zinc-300 rounded text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="text-xs text-zinc-400">(${shareAmount.toFixed(2)} ea)</span>
                          </div>
                        </div>
                      )}

                      {!isEqual && (
                        <div className="text-right">
                          <span className="text-xs bg-zinc-200/50 text-zinc-600 px-2 py-0.5 rounded font-medium">
                            Set individually per member
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveCategory(cat.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash className="w-4 h-4" />
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
