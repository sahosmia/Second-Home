'use client';

import React from 'react';
import { CostCategory } from '../types';
import { Trash, Settings, DollarSign, Plus } from 'lucide-react';

interface CategoryManagerProps {
  categories: CostCategory[];
  memberCount: number;
  onOpenAddCategoryModal: () => void;
  onRemoveCategory: (id: string) => void;
  onUpdateLumpSum: (id: string, lumpSum: number) => void;
}

export function CategoryManager({
  categories,
  memberCount,
  onOpenAddCategoryModal,
  onRemoveCategory,
  onUpdateLumpSum,
}: CategoryManagerProps) {
  return (
    <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Panel Header */}
      <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-zinc-800">Category & Settings</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
          <button
            type="button"
            onClick={onOpenAddCategoryModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all cursor-pointer"
            title="Add Custom Category"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Category</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Existing Categories List */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center text-zinc-400">
            <DollarSign className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
            <p className="text-xs font-bold text-zinc-700">No Adjustments Configured</p>
            <p className="text-[11px] max-w-xs mt-1 leading-relaxed">Click &apos;Add Category&apos; above to register utility bills, rents or customized dues.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const isPlus = cat.type === 'PLUS';
              const isEqual = cat.splitType === 'EQUAL';
              const shareAmount = isEqual && memberCount > 0 ? (cat.totalLumpSum || 0) / memberCount : 0;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 border border-zinc-200 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 transition-all gap-3 shadow-2xs hover:shadow-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isPlus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'
                        }`}
                      />
                      <h4 className="font-bold text-zinc-800 text-xs sm:text-sm truncate" title={cat.name}>
                        {cat.name}
                      </h4>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-tight ${
                          isPlus
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cat.type === 'PLUS' ? '+' : '-'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      Split: <strong className="text-zinc-700">{cat.splitType}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isEqual && (
                      <div className="flex items-center gap-1.5 bg-white border border-zinc-200 px-2 py-1 rounded-lg">
                        <span className="text-[10px] font-extrabold text-zinc-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={cat.totalLumpSum ?? 0}
                          onChange={(e) => onUpdateLumpSum(cat.id, parseFloat(e.target.value) || 0)}
                          className="w-14 px-0.5 py-0 bg-transparent text-[11px] font-bold text-zinc-800 border-0 focus:outline-none focus:ring-0 text-right"
                          title="Click to update total lump sum"
                        />
                        <span className="text-[9px] text-zinc-450 font-semibold" title={`$${shareAmount.toFixed(2)} each member`}>
                          (${shareAmount.toFixed(1)} ea)
                        </span>
                      </div>
                    )}

                    {!isEqual && (
                      <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-650 px-1.5 py-1 rounded-md font-semibold tracking-tight">
                        Custom Input
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveCategory(cat.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Delete category"
                    >
                      <Trash className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
