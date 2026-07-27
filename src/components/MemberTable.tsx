'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Member, CostCategory } from '../types';
import { Users, Plus, Edit2, Trash2, ShieldAlert, ShoppingBag, Utensils } from 'lucide-react';
import { EditMemberModal } from './EditMemberModal';

interface MemberTableProps {
  members: Member[];
  categories: CostCategory[];
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

export function MemberTable({
  members,
  categories,
  onOpenAddMemberModal,
  onRemoveMember,
  onUpdateMemberFull,
}: MemberTableProps) {
  const individualCategories = categories.filter((cat) => cat.splitType === 'INDIVIDUAL');

  const [mounted, setMounted] = useState<boolean>(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Modal State for Editing
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Modal State for Deletion Confirmation
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const handleEditClick = (member: Member) => {
    setEditingMember(member);
  };

  const handleDeleteClick = (member: Member) => {
    setDeletingMember(member);
  };

  const confirmDelete = () => {
    if (deletingMember) {
      onRemoveMember(deletingMember.id);
      setDeletingMember(null);
    }
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Section Header */}
      <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
          <h2 className="text-sm sm:text-base font-extrabold text-zinc-800">Members Ledger</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full">
            {members.length}
          </span>
          <button
            type="button"
            onClick={onOpenAddMemberModal}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-555 rounded-lg shadow-sm transition-all cursor-pointer active:scale-97"
            title="Add New Member"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-dashed border-zinc-200 rounded-2xl text-zinc-400">
            <Users className="w-10 h-10 mx-auto stroke-1 text-zinc-300 mb-2" />
            <p className="text-xs font-bold text-zinc-700">No Members Added Yet</p>
            <p className="text-[11px] max-w-xs mx-auto mt-1 leading-relaxed">
              Click &apos;Add Member&apos; above to register members and track mess contributions.
            </p>
          </div>
        ) : (
          /* Modern Card-based Member Grid (Tableless) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/20 hover:bg-zinc-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* Header: Name and Action Icons */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-150">
                  <h3 className="font-extrabold text-zinc-850 text-sm sm:text-base truncate max-w-[70%]" title={member.name}>
                    {member.name}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditClick(member)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                      title={`Edit ${member.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(member)}
                      className="p-1.5 text-zinc-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                      title={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Content Details */}
                <div className="space-y-2.5 flex-1">
                  {/* Bazaar Deposit row */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Bazaar Deposit:
                    </span>
                    <span className="font-extrabold text-zinc-800 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg shadow-3xs">
                      ৳{(member.bazaarAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Meals Eaten row */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Meals Eaten:
                    </span>
                    <span className="font-extrabold text-zinc-800 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg shadow-3xs">
                      {member.totalMeals || 0} meals
                    </span>
                  </div>

                  {/* Individual Custom Costs list */}
                  {individualCategories.length > 0 && (
                    <div className="pt-2 border-t border-zinc-150 space-y-2">
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Custom Fees / Adjustments
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {individualCategories.map((cat) => {
                          const costInput = member.customCosts?.find((c) => c.categoryId === cat.id);
                          const val = costInput ? costInput.amount : 0;
                          return (
                            <div
                              key={cat.id}
                              className="bg-white border border-zinc-150 p-2 rounded-xl flex flex-col justify-between gap-1 shadow-3xs"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-zinc-500 truncate" title={cat.name}>
                                  {cat.name}
                                </span>
                                <span className={`text-[8px] font-black px-1 rounded-xs uppercase ${cat.type === 'PLUS' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                                  {cat.type}
                                </span>
                              </div>
                              <span className="text-xs font-black text-zinc-850">
                                ৳{val.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
          onUpdateMember={onUpdateMemberFull}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {mounted && deletingMember && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transition-all scale-100 duration-200 text-zinc-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Delete Member?
              </h2>
            </div>

            <p className="text-sm text-zinc-450 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white font-black">{deletingMember.name}</strong> from the mess ledger? This will erase all of their records.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingMember(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/15 transition-all cursor-pointer active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
