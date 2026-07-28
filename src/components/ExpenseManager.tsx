'use client';

import React from 'react';
import { CostCategory, Member, ExpenseOccurrence } from '../types';
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
    totalLumpSum?: number,
    memberAmounts?: { [memberId: string]: number },
    occurrence?: ExpenseOccurrence
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
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all print:hidden">
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
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-555 rounded-lg shadow-sm transition-all cursor-pointer"
            title={getTranslation(language, 'addCategory')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{getTranslation(language, 'addCategory')}</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Existing Categories List */}
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center text-zinc-400">
            <DollarSign className="w-10 h-10 mb-2 stroke-1 text-zinc-300" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {getTranslation(language, 'noAdjustments')}
            </p>
            <p className="text-[11px] max-w-xs mt-1 leading-relaxed">
              {getTranslation(language, 'clickAddCategory')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="flex flex-col justify-between p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 gap-4"
                >
                  <div>
                    {/* Header: Name & edit/delete buttons */}
                    <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-zinc-800 dark:text-zinc-100 text-sm sm:text-base leading-tight break-words truncate" title={cat.name}>
                          {cat.name}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              isPlus
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400'
                            }`}
                          >
                            {cat.type}
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wider ${
                              cat.occurrence === 'ONE_TIME'
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400'
                                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                            }`}
                          >
                            {cat.occurrence === 'ONE_TIME'
                              ? getTranslation(language, 'occurrenceOneTime').split(' ')[0]
                              : getTranslation(language, 'occurrenceRegular').split(' ')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="p-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-md transition-all cursor-pointer border border-transparent hover:border-emerald-100 dark:hover:border-zinc-700"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveCategory(cat.id)}
                          className="p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 rounded-md transition-all cursor-pointer border border-transparent hover:border-rose-100 dark:hover:border-zinc-700"
                          title="Delete category"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Prominent Amount display on top, matching member cards */}
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-extrabold text-zinc-450 dark:text-zinc-555 uppercase tracking-wider">
                          {isEqual ? getTranslation(language, 'totalCost') : getTranslation(language, 'splitMode')}
                        </p>
                        {isEqual ? (
                          <h5 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
                            ৳{(cat.totalLumpSum || 0).toFixed(0)}
                          </h5>
                        ) : (
                          <h5 className="text-sm font-bold text-zinc-650 dark:text-zinc-350 tracking-tight mt-1 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-150 dark:border-zinc-850">
                            {getTranslation(language, 'customInput')}
                          </h5>
                        )}
                      </div>

                      {/* Details toggler */}
                      <button
                        type="button"
                        onClick={() => toggleExpenseDetails(cat.id)}
                        className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 bg-emerald-50/50 dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-zinc-700 hover:border-emerald-200 transition-all cursor-pointer"
                      >
                        {expandedExpenses[cat.id]
                          ? getTranslation(language, 'cancel').replace('Cancel', 'Hide').replace('বাতিল', 'আড়াল')
                          : getTranslation(language, 'addMember').replace('Add Member', 'Distribution').replace('মেম্বার যোগ করুন', 'বণ্টন')}
                      </button>
                    </div>

                    {/* Collapsible details matching member card drawer */}
                    {expandedExpenses[cat.id] && (
                      <div className="animate-slide-down mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3.5 text-left">
                        {isEqual ? (
                          <div className="space-y-3">
                            {/* Editable lump sum input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                {language === 'bn' ? 'মোট খরচ পরিবর্তন করুন' : 'Edit Total Amount'}
                              </label>
                              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-xl">
                                <span className="text-[11px] font-black text-zinc-400">৳</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={cat.totalLumpSum ?? 0}
                                  onChange={(e) => onUpdateLumpSum(cat.id, parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-100 border-0 focus:outline-none focus:ring-0"
                                />
                                <span className="text-[9px] text-zinc-450 dark:text-zinc-505 font-bold shrink-0">
                                  (৳{shareAmount.toFixed(1)} {getTranslation(language, 'eachShort')})
                                </span>
                              </div>
                            </div>

                            {/* Clickable Badge Distribution exclusion checklist */}
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-extrabold text-zinc-450 dark:text-zinc-400 uppercase tracking-wide flex items-center justify-between">
                                <span>{getTranslation(language, 'splitDistribution')} ({activeCount} / {members.length})</span>
                                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 normal-case font-semibold">{getTranslation(language, 'clickToExclude')}</span>
                              </p>
                              {members.length === 0 ? (
                                <p className="text-[10px] text-zinc-400 italic">{getTranslation(language, 'noMembersToSplit')}</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {members.map((member) => {
                                    const isExcluded = excludedIds.includes(member.id);
                                    return (
                                      <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => onToggleExclusion(cat.id, member.id)}
                                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                                          isExcluded
                                            ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-505 line-through decoration-zinc-450 dark:decoration-zinc-700'
                                            : 'bg-emerald-50/50 dark:bg-emerald-955/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                        }`}
                                        title={isExcluded ? `Include ${member.name}` : `Exclude ${member.name}`}
                                      >
                                        {isExcluded ? <UserMinus className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-450" />}
                                        <span>{member.name.split(' ')[0]}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // INDIVIDUAL category: display allocated amounts for each member
                          <div className="space-y-2">
                            <p className="text-[9px] font-extrabold text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
                              {language === 'bn' ? 'মেম্বার ভিত্তিক বন্টন' : 'Member-wise Distribution'}
                            </p>
                            <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                              {members.map((m) => {
                                const costInput = m.customCosts?.find((cc) => cc.categoryId === cat.id);
                                const amt = costInput ? costInput.amount : 0;
                                return (
                                  <div key={m.id} className="flex justify-between items-center text-[10px] text-zinc-500 py-0.5 border-b border-zinc-100/40 dark:border-zinc-800/30 last:border-0">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{m.name}</span>
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">৳{amt.toFixed(1)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
