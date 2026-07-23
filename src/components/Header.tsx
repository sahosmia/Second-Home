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
    <header className="bg-zinc-950 text-white shadow-md print:hidden w-full transition-all">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-zinc-950">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Second Home</h1>
            <p className="text-xs text-zinc-400">Zero-Backend Bachelor Mess Manager</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/80 rounded-lg transition-colors bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Summary
          </button>

          <button
            onClick={() => handleOpenModal('reset')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-300 border border-zinc-700/50 hover:border-zinc-500 rounded-lg transition-colors hover:bg-zinc-800 cursor-pointer"
            title="Reset mess data to high-fidelity template examples"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Template
          </button>

          <button
            onClick={() => handleOpenModal('clear')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-400 border border-rose-500/30 hover:border-rose-400/80 rounded-lg transition-colors bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-white mb-2">
              {modalAction === 'reset' ? 'Reset to Template Data?' : 'Clear All Data?'}
            </h2>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {modalAction === 'reset'
                ? 'This will overwrite your current settings and restore our high-fidelity sample members and expenses. Any unsaved edits will be lost!'
                : 'This will completely erase all current members, contributions, and categories. This action cannot be undone!'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                  modalAction === 'reset'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
