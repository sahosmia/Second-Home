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
import { generateMessImage } from '../src/utils/imageGenerator';
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
    generateMessPDF(messName, selectedMonth, summary, categories, members);
  };

  const handleDownloadImage = () => {
    generateMessImage(messName, selectedMonth, summary);
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
        onDownloadImage={handleDownloadImage}
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
          onToggleExclusion={toggleCategoryMemberExclusion}
        />
      </main>

      {/* Elegant attributions footer as requested */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 mt-12 print:hidden shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>any help or contract us</span>
            <a
              href="https://www.linkedin.com/in/sahosmia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:scale-110"
              title="LinkedIn"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/sahosridoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:scale-110"
              title="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
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
