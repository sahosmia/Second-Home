'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessCalculationSummary } from '../utils/calculations';
import { Member, CostCategory } from '../types';
import { ShoppingBag, Utensils, Award, TrendingUp, TrendingDown, Edit2, Trash2, ShieldAlert, Plus } from 'lucide-react';
import { EditMemberModal } from './EditMemberModal';
import { Language, getTranslation } from '../utils/translations';

interface SummaryDashboardProps {
  summary: MessCalculationSummary;
  categories: CostCategory[];
  language: Language;
  onOpenAddMemberModal: () => void;
  onRemoveMember: (id: string) => void;
  onUpdateMemberFull?: (
    id: string,
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    customCosts: { categoryId: string; amount: number }[]
  ) => void;
}

export function SummaryDashboard({
  summary,
  categories,
  language,
  onOpenAddMemberModal,
  onRemoveMember,
  onUpdateMemberFull,
}: SummaryDashboardProps) {
  const { totalBazaar, totalMeals, currentMealRate, results } = summary;

  const [mounted, setMounted] = useState<boolean>(false);
  
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Modal states for Editing & Deletion
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [expandedMembers, setExpandedMembers] = useState<{[id: string]: boolean}>({});

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
  };

  const handleDeleteClick = (member: Member) => {
    setDeletingMember(member);
  };

  const toggleMemberDetails = (id: string) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const confirmDelete = () => {
    if (deletingMember) {
      onRemoveMember(deletingMember.id);
      setDeletingMember(null);
    }
  };

  const individualCategories = categories.filter((cat) => cat.splitType === 'INDIVIDUAL');

  return (
    <section className="space-y-6 print:hidden">
      {/* 3-Column Top KPI Grid (Highly Responsive & Space-saving on Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
        {/* Total Bazaar */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 sm:p-6 flex items-center gap-2.5 sm:gap-5 shadow-xs hover:shadow-md transition-all duration-200 col-span-1">
          <div className="p-1.5 sm:p-4 bg-emerald-500/10 text-emerald-600 rounded-lg sm:rounded-xl shrink-0">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-xs font-black text-zinc-500 uppercase tracking-wider truncate">
              {getTranslation(language, 'totalBazaar')}
            </p>
            <h3 className="text-xs sm:text-2xl font-black text-zinc-900 mt-0.5 sm:mt-1 truncate">৳{totalBazaar.toFixed(0)}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-medium truncate hidden sm:block">
              {getTranslation(language, 'memberDeposits')}
            </p>
          </div>
        </div>

        {/* Total Meals */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 sm:p-6 flex items-center gap-2.5 sm:gap-5 shadow-xs hover:shadow-md transition-all duration-200 col-span-1">
          <div className="p-1.5 sm:p-4 bg-amber-500/10 text-amber-600 rounded-lg sm:rounded-xl shrink-0">
            <Utensils className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-xs font-black text-zinc-500 uppercase tracking-wider truncate">
              {getTranslation(language, 'totalMeals')}
            </p>
            <h3 className="text-xs sm:text-2xl font-black text-zinc-900 mt-0.5 sm:mt-1 truncate">{totalMeals.toFixed(1)}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-medium truncate hidden sm:block">
              {getTranslation(language, 'mealsEaten')}
            </p>
          </div>
        </div>

        {/* Current Meal Rate */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 sm:p-6 flex items-center gap-2.5 sm:gap-5 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="p-1.5 sm:p-4 bg-emerald-600/10 text-emerald-700 rounded-lg sm:rounded-xl shrink-0">
            <Award className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-xs font-black text-zinc-500 uppercase tracking-wider truncate">
              {getTranslation(language, 'mealRate')}
            </p>
            <h3 className="text-xs sm:text-2xl font-black text-zinc-900 mt-0.5 sm:mt-1 truncate">
              ৳{currentMealRate.toFixed(2)}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-medium truncate hidden sm:block">
              {getTranslation(language, 'bazaarMeals')}
            </p>
          </div>
        </div>
      </div>

      {/* Settlement Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-4">
          <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
            {getTranslation(language, 'settlementSheets')}
          </h3>
          <button
            type="button"
            onClick={onOpenAddMemberModal}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-555 rounded-lg shadow-sm transition-all cursor-pointer active:scale-97 shrink-0"
            title={getTranslation(language, 'addMember')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{getTranslation(language, 'addMember')}</span>
          </button>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl text-zinc-450 text-sm font-semibold shadow-3xs">
            <Plus className="w-8 h-8 mx-auto text-zinc-350 stroke-1.5 mb-2 animate-pulse cursor-pointer" onClick={onOpenAddMemberModal} />
            <p className="text-zinc-600 text-xs font-extrabold">
              {getTranslation(language, 'noMembersYet')}
            </p>
            <p className="text-[10px] text-zinc-400 mt-1">
              {getTranslation(language, 'clickAddMember')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map(({ member, finalBalance, mealExpense, netAdjustment, totalPersonalExpense }) => {
              const isOwed = finalBalance > 0;
              const isOwes = finalBalance < 0;
              const absBalance = Math.abs(finalBalance);

              return (
                <div
                  key={member.id}
                  className={`border rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all duration-200 bg-white hover:shadow-md hover:-translate-y-0.5 ${
                    isOwed
                      ? 'border-emerald-200 hover:border-emerald-400/80'
                      : isOwes
                      ? 'border-rose-200 hover:border-rose-400/80'
                      : 'border-zinc-200 hover:border-zinc-400/80'
                  }`}
                >
                  <div>
                    {/* Header Name & Action Controls / Settlement Status */}
                    <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-zinc-100">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-zinc-800 text-sm sm:text-base leading-tight break-words truncate" title={member.name}>
                          {member.name || 'Unnamed'}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {isOwed && (
                            <span className="flex items-center gap-0.5 text-[8px] font-extrabold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              <TrendingUp className="w-2.5 h-2.5" /> {getTranslation(language, 'receives')}
                            </span>
                          )}
                          {isOwes && (
                            <span className="flex items-center gap-0.5 text-[8px] font-extrabold bg-rose-50 text-rose-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              <TrendingDown className="w-2.5 h-2.5" /> {getTranslation(language, 'owes')}
                            </span>
                          )}
                          {!isOwed && !isOwes && (
                            <span className="text-[8px] font-extrabold bg-zinc-50 text-zinc-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              {getTranslation(language, 'settleZero')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add interactive edit and delete button controls on the sheet cards directly */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditClick(member)}
                          className="p-1 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                          title={`Edit ${member.name}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(member)}
                          className="p-1 text-zinc-400 hover:text-rose-650 hover:bg-rose-50 rounded-md transition-all cursor-pointer border border-transparent hover:border-rose-100"
                          title={`Delete ${member.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Final Net Amount Display */}
                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-extrabold text-zinc-450 uppercase tracking-wider">
                          {getTranslation(language, 'settlementBalance')}
                        </p>
                        <h5
                          className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${
                            isOwed
                              ? 'text-emerald-600'
                              : isOwes
                              ? 'text-rose-600'
                              : 'text-zinc-700'
                          }`}
                        >
                          {isOwed ? '+' : isOwes ? '-' : ''}৳{absBalance.toFixed(2)}
                        </h5>
                      </div>
                      
                      {/* Compact Details Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleMemberDetails(member.id)}
                        className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-500 bg-emerald-50/50 px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-all cursor-pointer"
                      >
                        {expandedMembers[member.id]
                          ? getTranslation(language, 'cancel').replace('Cancel', 'Hide Details').replace('বাতিল', 'আড়াল করুন')
                          : getTranslation(language, 'addMember').replace('Add Member', 'Show Details').replace('মেম্বার যোগ করুন', 'হিসাব দেখুন')}
                      </button>
                    </div>

                    {/* Collapsible Details Content block */}
                    {expandedMembers[member.id] && (
                      <div className="animate-slide-down">
                        {/* Expanded Costs Breakdown */}
                        <div className="mt-4 space-y-1.5 border-t border-zinc-100 pt-3 text-[10px] sm:text-xs text-left">
                          <div className="flex justify-between items-center text-zinc-500">
                            <span className="hidden sm:inline">{getTranslation(language, 'bazaarDepositLabel')}</span>
                            <span className="inline sm:hidden">{getTranslation(language, 'depositLabel')}</span>
                            <span className="font-bold text-zinc-700">৳{(member.bazaarAmount || 0).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-500">
                            <span>{getTranslation(language, 'mealsLabel', { count: member.totalMeals || 0 })}</span>
                            <span className="font-bold text-zinc-700">৳{mealExpense.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center text-zinc-500">
                            <span className="hidden sm:inline">{getTranslation(language, 'adjustmentsLabel')}</span>
                            <span className="inline sm:hidden">{getTranslation(language, 'adjustsLabel')}</span>
                            <span className={`font-bold ${netAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {netAdjustment >= 0 ? '+' : '-'}৳{Math.abs(netAdjustment).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Present list of individual custom costs inside the sheet card only if they are non-zero */}
                        {(() => {
                          const activeCustomCosts = individualCategories.filter((cat) => {
                            const costInput = member.customCosts?.find((c) => c.categoryId === cat.id);
                            return costInput && costInput.amount > 0;
                          });

                          if (activeCustomCosts.length === 0) return null;

                          return (
                            <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2 text-left">
                              <p className="text-[8px] font-extrabold text-zinc-400 uppercase tracking-wider">
                                {getTranslation(language, 'customAdjustments')}
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {activeCustomCosts.map((cat) => {
                                  const costInput = member.customCosts?.find((c) => c.categoryId === cat.id);
                                  const val = costInput ? costInput.amount : 0;
                                  return (
                                    <div
                                      key={cat.id}
                                      className="bg-zinc-50/50 border border-zinc-150 p-1.5 rounded-lg flex flex-col justify-between gap-0.5"
                                    >
                                      <div className="flex items-center justify-between gap-1 min-w-0">
                                        <span className="text-[8px] font-bold text-zinc-500 truncate" title={cat.name}>
                                          {cat.name}
                                        </span>
                                        <span className={`text-[7px] font-black px-0.5 rounded-xs uppercase scale-90 origin-right ${cat.type === 'PLUS' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                          {cat.type}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-black text-zinc-750">
                                        ৳{val.toFixed(1)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Summary Box Footer */}
                  {expandedMembers[member.id] && (
                    <div className="mt-4 pt-2.5 border-t border-zinc-100 bg-zinc-50/50 -mx-5 -mb-5 px-5 py-2.5 rounded-b-2xl flex justify-between items-center animate-slide-down">
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider hidden sm:inline">{getTranslation(language, 'totalPersonalCost')}</span>
                      <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider inline sm:hidden">{getTranslation(language, 'totalCost')}</span>
                      <span className="text-xs font-bold text-zinc-800">৳{totalPersonalExpense.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && onUpdateMemberFull && (
        <EditMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          categories={categories}
          member={editingMember}
          language={language}
          onUpdateMember={onUpdateMemberFull}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {mounted && deletingMember && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-all scale-100 duration-200 text-zinc-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-lg font-extrabold text-white">
                {getTranslation(language, 'deleteMemberTitle')}
              </h2>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {getTranslation(language, 'deleteMemberConfirm', { name: deletingMember.name })}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingMember(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer text-center"
              >
                {getTranslation(language, 'cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/15 transition-all cursor-pointer active:scale-95 text-center"
              >
                {getTranslation(language, 'yesDelete')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
