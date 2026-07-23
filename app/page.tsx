'use client';

import React from 'react';
import { useMessState } from '../src/hooks/useMessState';
import { calculateMessDetails } from '../src/utils/calculations';
import { Header } from '../src/components/Header';
import { SummaryDashboard } from '../src/components/SummaryDashboard';
import { CategoryManager } from '../src/components/CategoryManager';
import { MemberTable } from '../src/components/MemberTable';
import { PrintView } from '../src/components/PrintView';

export default function Home() {
  const {
    categories,
    members,
    addCategory,
    removeCategory,
    updateCategoryLumpSum,
    addMember,
    removeMember,
    updateMemberBasic,
    updateMemberCustomCost,
    clearAllData,
    resetToDefault,
  } = useMessState();

  // Run dynamic math engine over current live memory states
  const summary = calculateMessDetails(members, categories);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* SaaS Interactive Header Controls */}
      <Header
        onReset={resetToDefault}
        onClear={clearAllData}
        onPrint={handlePrint}
      />

      {/* Main Responsive Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 print:hidden">
        {/* Intro Branding */}
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Instant Mess Calculator
          </h2>
          <p className="text-sm text-zinc-500 max-w-2xl font-medium">
            Seamless bachelor flat share, mess meal tracking, and customized individual expenses. Fill or modify values below to view instant, real-time recalculations.
          </p>
        </div>

        {/* Dashboard Analytics & Summary */}
        <SummaryDashboard summary={summary} />

        {/* Categories Manager Panel */}
        <CategoryManager
          categories={categories}
          memberCount={members.length}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          onUpdateLumpSum={updateCategoryLumpSum}
        />

        {/* Interactive Member Ledger Grid */}
        <MemberTable
          members={members}
          categories={categories}
          onAddMember={addMember}
          onRemoveMember={removeMember}
          onUpdateMemberBasic={updateMemberBasic}
          onUpdateMemberCustomCost={updateMemberCustomCost}
        />
      </main>

      {/* Elegant, clean Print Invoice View (Displays strictly when printing) */}
      <PrintView summary={summary} categories={categories} />
    </div>
  );
}
