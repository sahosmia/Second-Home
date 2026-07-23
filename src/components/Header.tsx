'use client';

import React, { useState } from 'react';
import { Home, RotateCcw, Trash2, Printer } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onClear: () => void;
  onPrint: () => void;
}

export function Header({ onReset, onClear, onPrint }: HeaderProps) {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'reset' | 'clear' | null>(null);

  const handleOpenModal = (action: 'reset' | 'clear') => {
    setModalAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (modalAction === 'reset') {
      onReset();
    } else if (modalAction === 'clear') {
      onClear();
    }
    setShowConfirmModal(false);
    setModalAction(null);
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 text-white shadow-lg print:hidden w-full sticky top-0 z-40 backdrop-blur-md bg-zinc-900/95">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-zinc-950 shadow-md shadow-emerald-500/20">
            <Home className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Second Home
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">Monthly Bachelor Mess Expense Calculator</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onPrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/80 rounded-lg transition-all bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => handleOpenModal('reset')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-300 border border-zinc-700/60 hover:border-zinc-500 rounded-lg transition-all hover:bg-zinc-800 cursor-pointer active:scale-98"
            title="Reset mess data to template examples"
          >
            <RotateCcw className="w-4 h-4 shrink-0 text-zinc-400" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => handleOpenModal('clear')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-400 border border-rose-500/30 hover:border-rose-400/80 rounded-lg transition-all bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* High-Fidelity Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-all scale-100 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${modalAction === 'reset' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {modalAction === 'reset' ? <RotateCcw className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
              </div>
              <h2 className="text-lg font-extrabold text-white">
                {modalAction === 'reset' ? 'Restore Template Demo?' : 'Erase All Mess Ledger?'}
              </h2>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {modalAction === 'reset'
                ? 'This will overwrite your current configurations and restore our fully pre-filled bachelor mess example. Any custom updates in progress will be replaced.'
                : 'This will completely empty all dynamic categories, bills, and members. This action cannot be reversed.'}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-850 rounded-xl transition-all cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95 ${
                  modalAction === 'reset'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/10'
                }`}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
