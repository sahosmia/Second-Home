'use client';

import React, { useState } from 'react';
import { useMessState } from '../src/hooks/useMessState';
import { calculateMessDetails } from '../src/utils/calculations';
import { Header } from '../src/components/Header';
import { SummaryDashboard } from '../src/components/SummaryDashboard';
import { CategoryManager } from '../src/components/CategoryManager';
import { MemberTable } from '../src/components/MemberTable';
import { AddMemberModal } from '../src/components/AddMemberModal';
import { AddCategoryModal } from '../src/components/AddCategoryModal';
import { generateMessPDF } from '../src/utils/pdfGenerator';

export default function Home() {
  const {
    categories,
    members,
    messName,
    setMessName,
    selectedMonth,
    setSelectedMonth,
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

  // Modal open states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  // Run dynamic math engine over current live memory states
  const summary = calculateMessDetails(members, categories);

  const handleDownloadPDF = () => {
    generateMessPDF(messName, selectedMonth, summary);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* SaaS Interactive Header Controls */}
      <Header
        messName={messName}
        setMessName={setMessName}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onReset={resetToDefault}
        onClear={clearAllData}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Main Responsive Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 print:hidden">
        {/* Intro Branding */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Instant Mess Calculator
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl font-medium">
            Seamless bachelor flat share, mess meal tracking, and customized individual expenses. Fill or modify values below to view instant, real-time recalculations.
          </p>
        </div>

        {/* Dashboard Analytics & Summary */}
        <SummaryDashboard summary={summary} />

        {/* REVISED PAGE LAYOUT ORDER:
            1. Top Section: Mess Members Ledger & Main Input Table.
            2. Bottom Section: Dynamic Category Management & Settings. */}

        {/* Interactive Member Ledger Grid */}
        <MemberTable
          members={members}
          categories={categories}
          onOpenAddMemberModal={() => setIsMemberModalOpen(true)}
          onRemoveMember={removeMember}
          onUpdateMemberBasic={updateMemberBasic}
          onUpdateMemberCustomCost={updateMemberCustomCost}
        />

        {/* Categories Manager Panel */}
        <CategoryManager
          categories={categories}
          memberCount={members.length}
          onOpenAddCategoryModal={() => setIsCategoryModalOpen(true)}
          onRemoveCategory={removeCategory}
          onUpdateLumpSum={updateCategoryLumpSum}
        />
      </main>

      {/* Modal Forms */}
      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onAddMember={addMember}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        memberCount={members.length}
        onAddCategory={addCategory}
      />
    </div>
  );
}
