'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Home,
  RotateCcw,
  Trash2,
  Download,
  Edit2,
  Check,
  Calendar,
  Menu,
  X,
  Languages,
  Sun,
  Moon,
  Tv,
  ImageIcon,
  MoreVertical
} from 'lucide-react';
import { Language, getTranslation } from '../utils/translations';
import { Theme } from '../hooks/useMessState';

interface HeaderProps {
  messName: string;
  setMessName: (name: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  onClear: (isHard?: boolean) => void;
  onDownloadPDF: () => void;
  onDownloadImage: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export function Header({
  messName,
  setMessName,
  selectedMonth,
  setSelectedMonth,
  language,
  setLanguage,
  onReset,
  onClear,
  onDownloadPDF,
  onDownloadImage,
  theme,
  setTheme
}: HeaderProps) {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'reset' | 'clear' | null>(null);
  const [isHardResetChecked, setIsHardResetChecked] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Responsive mobile menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState<boolean>(false);

  // Inline editing for Mess Name
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(messName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setMessName(tempName.trim());
    } else {
      setTempName(messName);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setTempName(messName);
      setIsEditingName(false);
    }
  };

  const handleOpenModal = (action: 'reset' | 'clear') => {
    setModalAction(action);
    setIsHardResetChecked(false);
    setShowConfirmModal(true);
    setMobileMenuOpen(false);
  };

  const handleConfirm = () => {
    if (modalAction === 'reset') {
      onReset();
    } else if (modalAction === 'clear') {
      onClear(isHardResetChecked);
    }
    setShowConfirmModal(false);
    setModalAction(null);
  };

  // Generate Month list options (last 6 months and next 6 months)
  const getMonthOptions = () => {
    const options = [];
    const date = new Date();
    // Prevent classic JS Month Overflow bug by setting day of month to 1 first
    date.setDate(1);
    date.setMonth(date.getMonth() - 6);

    for (let i = 0; i < 13; i++) {
      const year = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const val = `${year}-${monthStr}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ val, label });
      date.setMonth(date.getMonth() + 1);
    }
    return options;
  };

  const monthOptions = getMonthOptions();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 text-white shadow-lg print:hidden w-full sticky top-0 z-40 backdrop-blur-md bg-zinc-900/95">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name (Editable Inline) */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-zinc-950 shadow-md shadow-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={handleKeyDown}
                  className="bg-zinc-800 border border-emerald-500 text-white text-base font-extrabold px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 bg-emerald-500 text-zinc-950 rounded hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempName(messName);
                  setIsEditingName(true);
                }}
                className="flex items-center gap-1.5 cursor-pointer group"
                title="Click to edit Mess Name"
              >
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-teal-200 transition-all">
                  {messName}
                </h1>
                <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            <p className="text-[10px] text-zinc-400 font-semibold tracking-wide">
              {getTranslation(language, 'subBrandName')}
            </p>
          </div>
        </div>

        {/* Month Selector Dropdown & Action Controls (Desktop View) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector Button */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-300 border border-zinc-700/60 hover:border-emerald-500/50 rounded-xl transition-all hover:bg-zinc-800 cursor-pointer active:scale-97"
            title="ভাষা পরিবর্তন করুন / Change Language"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Theme Selector Toggle */}
          <div className="flex bg-zinc-800/80 border border-zinc-700/60 rounded-xl p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title={getTranslation(language, 'themeLight')}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title={getTranslation(language, 'themeDark')}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'system' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title={getTranslation(language, 'themeSystem')}
            >
              <Tv className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Month Dropdown Selector */}
          <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus-within:border-emerald-500 transition-all">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-semibold outline-none border-0 cursor-pointer text-xs pr-1"
            >
              {monthOptions.map((opt) => (
                <option key={opt.val} value={opt.val} className="bg-zinc-900 text-white font-medium">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unified Actions 3-dot Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-300 border border-zinc-700/60 hover:border-emerald-500/50 rounded-xl transition-all hover:bg-zinc-800 cursor-pointer active:scale-97"
              title={language === 'bn' ? 'কার্যক্রম মেনু' : 'Actions Menu'}
            >
              <MoreVertical className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'কার্যক্রম' : 'Actions'}</span>
            </button>

            {actionsMenuOpen && (
              <>
                {/* Backdrop overlay to close when clicking outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActionsMenuOpen(false)}
                />
                
                {/* Floating Absolute Dropdown Card */}
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-950 border border-zinc-855 p-2.5 shadow-2xl z-50 animate-slide-down space-y-1">
                  {/* Download PDF */}
                  <button
                    onClick={() => {
                      onDownloadPDF();
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{getTranslation(language, 'downloadSummary')}</span>
                  </button>

                  {/* Download PNG Image */}
                  <button
                    onClick={() => {
                      onDownloadImage();
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-teal-400" />
                    <span>{language === 'bn' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}</span>
                  </button>

                  {/* Restore Demo Template */}
                  <button
                    onClick={() => {
                      handleOpenModal('reset');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-zinc-400" />
                    <span>{getTranslation(language, 'requestDemo')}</span>
                  </button>

                  {/* Clear All Data */}
                  <button
                    onClick={() => {
                      handleOpenModal('clear');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-zinc-900 text-rose-450 hover:text-rose-350 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>{getTranslation(language, 'clearAll')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hamburger Menu Icon for Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {/* Quick Theme Toggle on Mobile Header */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')}
            className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:text-white"
            title="Toggle theme / থিম পরিবর্তন করুন"
          >
            {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Tv className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          {/* Quick Language Toggle on Mobile Header */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="p-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-[11px] font-bold"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </button>
          {/* Calendar Select also shown on mobile header directly for easy accessibility */}
          <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-[11px] text-zinc-300">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.val} value={opt.val} className="bg-zinc-900 text-white font-medium">
                  {opt.label.split(' ')[0]} {opt.label.split(' ')[1].slice(2)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 bg-zinc-800 border border-zinc-700/80 hover:bg-zinc-700 rounded-xl transition-all cursor-pointer text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 p-4 space-y-3 animate-slide-down">
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => {
                onDownloadPDF();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {getTranslation(language, 'downloadSummary')}
            </button>

            <button
              onClick={() => {
                onDownloadImage();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 text-xs font-bold transition-all"
            >
              <ImageIcon className="w-4 h-4 text-teal-400" />
              {language === 'bn' ? 'ছবি ডাউনলোড করুন' : 'Download Image'}
            </button>

            <button
              onClick={() => handleOpenModal('reset')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
              {getTranslation(language, 'requestDemo')}
            </button>

            <button
              onClick={() => handleOpenModal('clear')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-450" />
              {getTranslation(language, 'clearAll')}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {mounted && showConfirmModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-all scale-100 duration-200 text-zinc-100">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${modalAction === 'reset' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {modalAction === 'reset' ? <RotateCcw className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-extrabold text-white">
                {modalAction === 'reset' ? getTranslation(language, 'restoreTemplate') : getTranslation(language, 'eraseAllLedger')}
              </h2>
            </div>
            
            <div className="text-sm text-zinc-400 leading-relaxed mb-6">
              {modalAction === 'reset' ? (
                getTranslation(language, 'restoreTemplateBody')
              ) : (
                <div className="space-y-4">
                  <p className="font-medium text-zinc-200">
                    {getTranslation(language, 'resetMessage')}
                  </p>
                  <label className="flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 p-3 rounded-xl border border-zinc-800 cursor-pointer select-none transition-colors text-left">
                    <input
                      type="checkbox"
                      checked={isHardResetChecked}
                      onChange={(e) => setIsHardResetChecked(e.target.checked)}
                      className="w-4.5 h-4.5 accent-rose-500 rounded border-zinc-700 bg-zinc-950 focus:ring-rose-500 text-rose-500 cursor-pointer"
                    />
                    <span className="text-xs text-zinc-300 font-semibold leading-tight">
                      {getTranslation(language, 'hardResetCheckbox')}
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer text-center"
              >
                {getTranslation(language, 'noGoBack')}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95 text-center ${
                  modalAction === 'reset'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/10'
                }`}
              >
                {getTranslation(language, 'yesConfirm')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
