'use client';

import React, { useState } from 'react';
import { useMessState } from '../src/hooks/useMessState';
import { calculateMessDetails } from '../src/utils/calculations';
import { Header } from '../src/components/Header';
import { SummaryDashboard } from '../src/components/SummaryDashboard';
import { ExpenseManager } from '../src/components/ExpenseManager';
import { AddMemberModal } from '../src/components/AddMemberModal';
import { AddExpenseModal } from '../src/components/AddExpenseModal';
import { generateMessPDF } from '../src/utils/pdfGenerator';
import { getTranslation } from '../src/utils/translations';

export default function Home() {
  const {
    categories,
    members,
    messName,
    setMessName,
    selectedMonth,
    setSelectedMonth,
    language,
    setLanguage,
    addCategory,
    removeCategory,
    updateCategory,
    updateCategoryLumpSum,
    toggleCategoryMemberExclusion,
    addMember,
    removeMember,
    clearAllData,
    resetToDefault,
    isLoaded,
    updateMemberFull,
    theme,
    setTheme,
  } = useMessState();

  // Modal open states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  // Run dynamic math engine over current live memory states
  const summary = calculateMessDetails(members, categories);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-955 flex flex-col items-center justify-center font-sans text-zinc-100 gap-4">
        {/* Animated Custom Ring Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/15"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500 animate-spin"></div>
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-black tracking-wider bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            {getTranslation(language, 'brandName')}
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            {getTranslation(language, 'loadingLedger')}
          </p>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    generateMessPDF(messName, selectedMonth, summary);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans text-zinc-900 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* SaaS Interactive Header Controls */}
      <Header
        messName={messName}
        setMessName={setMessName}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        language={language}
        setLanguage={setLanguage}
        onReset={resetToDefault}
        onClear={clearAllData}
        onDownloadPDF={handleDownloadPDF}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Responsive Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 print:hidden">
        {/* Intro Branding */}
        <div className="space-y-1 sm:space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight text-center sm:text-left">
            {getTranslation(language, 'instantCalculator')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl font-medium hidden sm:block">
            {getTranslation(language, 'brandingSub')}
          </p>
        </div>

        {/* Dashboard Analytics & Summary (which now hosts Add, Edit, Delete members sheet) */}
        <SummaryDashboard
          summary={summary}
          categories={categories}
          language={language}
          onOpenAddMemberModal={() => setIsMemberModalOpen(true)}
          onRemoveMember={removeMember}
          onUpdateMemberFull={updateMemberFull}
        />

        {/* Categories Manager Panel */}
        <ExpenseManager
          categories={categories}
          members={members}
          language={language}
          onOpenAddCategoryModal={() => setIsCategoryModalOpen(true)}
          onRemoveCategory={removeCategory}
          onUpdateCategory={updateCategory}
          onUpdateLumpSum={updateCategoryLumpSum}
          onToggleExclusion={toggleCategoryMemberExclusion}
        />
      </main>

      {/* Elegant attributions footer as requested */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 mt-12 print:hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span>Design and Develop by</span>
            <a
              href="https://www.facebook.com/sahosridoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold"
            >
              Sahos Mia
            </a>
          </div>
          <div>
            <span>{getTranslation(language, 'brandName')} Mess Engine v1.3</span>
          </div>
        </div>
      </footer>

      {/* Modal Forms with dynamic keys to force state resetting on mount */}
      {isMemberModalOpen && (
        <AddMemberModal
          key={`member-modal-${isMemberModalOpen}`}
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          categories={categories}
          language={language}
          onAddMember={addMember}
        />
      )}

      {isCategoryModalOpen && (
        <AddExpenseModal
          key={`category-modal-${isCategoryModalOpen}`}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          members={members}
          language={language}
          onAddExpense={addCategory}
        />
      )}
    </div>
  );
}
