'use client';

import React from 'react';
import { CostCategory, Member } from '../types';
import { Trash, Settings, DollarSign, Plus, UserMinus, UserCheck, Edit2 } from 'lucide-react';

import { Language, getTranslation } from '../utils/translations';
import { EditExpenseModal } from './EditExpenseModal';
import { useState } from 'react';

interface ExpenseManagerProps {
  categories: CostCategory[];
  members: Member[];
  language: Language;
  onOpenAddCategoryModal: () => void;
  onRemoveCategory: (id: string) => void;
  onUpdateCategory: (
    id: string,
    name: string,
    type: 'PLUS' | 'MINUS',
    splitType: 'EQUAL' | 'INDIVIDUAL',
    totalLumpSum?: number
  ) => void;
  onUpdateLumpSum: (id: string, lumpSum: number) => void;
  onToggleExclusion: (categoryId: string, memberId: string) => void;
}

export function ExpenseManager({
  categories,
  members,
  language,
  onOpenAddCategoryModal,
  onRemoveCategory,
  onUpdateCategory,
  onUpdateLumpSum,
  onToggleExclusion,
}: ExpenseManagerProps) {
  const [editingCategory, setEditingCategory] = useState<CostCategory | null>(null);
  const [expandedExpenses, setExpandedExpenses] = useState<{[id: string]: boolean}>({});

  const toggleExpenseDetails = (id: string) => {
    setExpandedExpenses((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Panel Header */}
      <div className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 px-6 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Settings className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-zinc-800 dark:text-zinc-100">
            {getTranslation(language, 'categorySettings')}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
          <button
            type="button"
            onClick={onOpenAddCategoryModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all cursor-pointer"
            title={getTranslation(language, 'addCategory')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getTranslation(language, 'addCategory')}</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Existing Categories List */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center text-zinc-400">
            <DollarSign className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
            <p className="text-xs font-bold text-zinc-700">
              {getTranslation(language, 'noAdjustments')}
            </p>
            <p className="text-[11px] max-w-xs mt-1 leading-relaxed">
              {getTranslation(language, 'clickAddCategory')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const isPlus = cat.type === 'PLUS';
              const isEqual = cat.splitType === 'EQUAL';
              const excludedIds = cat.excludedMemberIds || [];
              
              // Calculate shares dynamically
              const activeCount = members.filter((m) => !excludedIds.includes(m.id)).length;
              const shareAmount = isEqual && activeCount > 0 ? (cat.totalLumpSum || 0) / activeCount : 0;

              return (
                <div
                  key={cat.id}
                  className="flex flex-col p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-50 dark:hover:bg-zinc-950/60 transition-all gap-3.5 shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            isPlus ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'
                          }`}
                        />
                        <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 text-xs sm:text-sm truncate" title={cat.name}>
                          {cat.name}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-tight ${
                            isPlus
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-450'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-450'
                          }`}
                        >
                          {cat.type === 'PLUS' ? '+' : '-'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <span>{getTranslation(language, 'splitMode')} <strong className="text-zinc-700 dark:text-zinc-300">{cat.splitType}</strong></span>
                        {isEqual && (
                          <button
                            type="button"
                            onClick={() => toggleExpenseDetails(cat.id)}
                            className="text-[9px] font-black text-emerald-600 dark:text-emerald-455 hover:text-emerald-500 bg-emerald-50/50 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                          >
                            {expandedExpenses[cat.id]
                              ? getTranslation(language, 'cancel').replace('Cancel', 'Hide').replace('বাতিল', 'আড়াল')
                              : getTranslation(language, 'addMember').replace('Add Member', 'Distribution').replace('মেম্বার যোগ করুন', 'বণ্টন')}
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isEqual && (
                        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-lg">
                          <span className="text-[10px] font-extrabold text-zinc-400">৳</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={cat.totalLumpSum ?? 0}
                            onChange={(e) => onUpdateLumpSum(cat.id, parseFloat(e.target.value) || 0)}
                            className="w-14 px-0.5 py-0 bg-transparent text-[11px] font-bold text-zinc-800 dark:text-zinc-100 border-0 focus:outline-none focus:ring-0 text-right"
                            title="Click to update total lump sum"
                          />
                          <span className="text-[9px] text-zinc-450 dark:text-zinc-400 font-bold" title={`৳${shareAmount.toFixed(2)} each for ${activeCount} members`}>
                            (৳{shareAmount.toFixed(1)} {getTranslation(language, 'eachShort')})
                          </span>
                        </div>
                      )}

                      {!isEqual && (
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 px-1.5 py-1 rounded-md font-semibold tracking-tight">
                          {getTranslation(language, 'customInput')}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-850 rounded-lg transition-all cursor-pointer"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveCategory(cat.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-850 rounded-lg transition-all cursor-pointer"
                        title="Delete category"
                      >
                        <Trash className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* EQUAL split exclusion management */}
                  {isEqual && expandedExpenses[cat.id] && (
                    <div className="pt-2.5 border-t border-zinc-150 dark:border-zinc-800 space-y-1.5 animate-slide-down text-left">
                      <p className="text-[10px] font-extrabold text-zinc-450 dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                        <span>{getTranslation(language, 'splitDistribution')} ({activeCount} / {members.length})</span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 normal-case font-semibold">{getTranslation(language, 'clickToExclude')}</span>
                      </p>
                      
                      {members.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 italic">{getTranslation(language, 'noMembersToSplit')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {members.map((member) => {
                            const isExcluded = excludedIds.includes(member.id);
                            return (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() => onToggleExclusion(cat.id, member.id)}
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                  isExcluded
                                    ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-455'
                                    : 'bg-emerald-50/50 dark:bg-emerald-955/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                }`}
                                title={isExcluded ? `Include ${member.name}` : `Exclude ${member.name}`}
                              >
                                {isExcluded ? <UserMinus className="w-3 h-3 text-zinc-455" /> : <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-450" />}
                                <span>{member.name.split(' ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingCategory && (
        <EditExpenseModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          members={members}
          language={language}
          onUpdateExpense={onUpdateCategory}
        />
      )}
    </section>
  );
}
