'use client';

import React from 'react';
import { Member, CostCategory } from '../types';
import { Users, Plus, Trash } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  categories: CostCategory[];
  onOpenAddMemberModal: () => void;
  onRemoveMember: (id: string) => void;
  onUpdateMemberBasic: (id: string, field: 'name' | 'bazaarAmount' | 'totalMeals', value: string | number) => void;
  onUpdateMemberCustomCost: (memberId: string, categoryId: string, amount: number) => void;
}

export function MemberTable({
  members,
  categories,
  onOpenAddMemberModal,
  onRemoveMember,
  onUpdateMemberBasic,
  onUpdateMemberCustomCost,
}: MemberTableProps) {
  const individualCategories = categories.filter((cat) => cat.splitType === 'INDIVIDUAL');

  return (
    <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Table Header */}
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
            <span className="hidden sm:inline">Add Member</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
            <Users className="w-10 h-10 mx-auto stroke-1 text-zinc-300 mb-2" />
            <p className="text-xs font-bold text-zinc-700">No Members Added Yet</p>
            <p className="text-[11px] max-w-xs mx-auto mt-1 leading-relaxed">
              Click &apos;Add Member&apos; above to register members and track mess contributions.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop and Tablet View: Traditional Table Layout */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 rounded-xl shadow-2xs">
              <table className="w-full border-collapse text-left text-xs text-zinc-650 min-w-[650px]">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">
                    <th scope="col" className="px-5 py-3 min-w-[150px]">
                      Member Name
                    </th>
                    <th scope="col" className="px-5 py-3 text-center min-w-[120px]">
                      Bazaar (৳)
                    </th>
                    <th scope="col" className="px-5 py-3 text-center min-w-[90px]">
                      Meals
                    </th>

                    {/* Dynamic Individual Custom Category Columns */}
                    {individualCategories.map((cat) => (
                      <th
                        key={cat.id}
                        scope="col"
                        className="px-5 py-3 text-center min-w-[120px]"
                      >
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-zinc-600">{cat.name}</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm mt-0.5 uppercase tracking-tight ${
                              cat.type === 'PLUS'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {cat.type === 'PLUS' ? '+' : '-'}
                          </span>
                        </div>
                      </th>
                    ))}

                    <th scope="col" className="px-5 py-3 text-center w-[50px]">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 bg-white">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-50/40 transition-colors group">
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => onUpdateMemberBasic(member.id, 'name', e.target.value)}
                          className="font-extrabold text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 px-1 py-0.5 w-full text-xs rounded-sm transition-all"
                        />
                      </td>

                      {/* Bazaar */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1 max-w-[100px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2 py-0.5 rounded-lg border border-zinc-200 transition-all">
                          <span className="text-zinc-400 font-bold text-[10px]">৳</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={member.bazaarAmount ?? ''}
                            onChange={(e) =>
                              onUpdateMemberBasic(
                                member.id,
                                'bazaarAmount',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-855 font-bold text-xs p-0"
                          />
                        </div>
                      </td>

                      {/* Meals */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center max-w-[70px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-1.5 py-0.5 rounded-lg border border-zinc-200 transition-all">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={member.totalMeals ?? ''}
                            onChange={(e) =>
                              onUpdateMemberBasic(
                                member.id,
                                'totalMeals',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-855 font-bold text-xs p-0"
                          />
                        </div>
                      </td>

                      {/* Individual Dynamic Categories */}
                      {individualCategories.map((cat) => {
                        const costInput = member.customCosts.find((c) => c.categoryId === cat.id);
                        const val = costInput ? costInput.amount : 0;

                        return (
                          <td key={cat.id} className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1 max-w-[100px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2 py-0.5 rounded-lg border border-zinc-200 transition-all">
                              <span className="text-zinc-455 font-semibold text-[10px]">৳</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={val || ''}
                                placeholder="0.00"
                                onChange={(e) =>
                                  onUpdateMemberCustomCost(
                                    member.id,
                                    cat.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800 text-xs font-semibold p-0"
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Delete Action button */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          title={`Delete ${member.name}`}
                        >
                          <Trash className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Clean Card-based Layout (NO Horizontal Scrolling) */}
            <div className="md:hidden space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="border border-zinc-250 rounded-xl p-4 bg-zinc-50/40 hover:bg-zinc-50 transition-all space-y-4 shadow-2xs"
                >
                  {/* Card Header: Member Name & Delete Action */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => onUpdateMemberBasic(member.id, 'name', e.target.value)}
                      className="font-extrabold text-zinc-800 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 px-2.5 py-1.5 w-full text-xs rounded-xl shadow-3xs transition-all"
                      placeholder="Member Name"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-zinc-200 transition-all cursor-pointer"
                      title={`Delete ${member.name}`}
                    >
                      <Trash className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  {/* Card Fields: 2-Column Responsive Form Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Bazaar Amount */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                        Bazaar Deposit
                      </label>
                      <div className="flex items-center gap-1 bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2.5 py-1.5 rounded-xl border border-zinc-200 transition-all">
                        <span className="text-zinc-400 font-bold text-[10px]">৳</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={member.bazaarAmount ?? ''}
                          onChange={(e) =>
                            onUpdateMemberBasic(
                              member.id,
                              'bazaarAmount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800 font-bold text-xs p-0"
                        />
                      </div>
                    </div>

                    {/* Total Meals */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                        Meals Eaten
                      </label>
                      <div className="flex items-center bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2.5 py-1.5 rounded-xl border border-zinc-200 transition-all">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={member.totalMeals ?? ''}
                          onChange={(e) =>
                            onUpdateMemberBasic(
                              member.id,
                              'totalMeals',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800 font-bold text-xs p-0"
                        />
                      </div>
                    </div>

                    {/* Dynamic Custom Individual Categories */}
                    {individualCategories.map((cat) => {
                      const costInput = member.customCosts.find((c) => c.categoryId === cat.id);
                      const val = costInput ? costInput.amount : 0;

                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider truncate" title={cat.name}>
                              {cat.name}
                            </span>
                            <span
                              className={`text-[8px] font-black px-1 rounded-sm uppercase tracking-tight shrink-0 ${
                                cat.type === 'PLUS'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-rose-50 text-rose-800'
                              }`}
                            >
                              {cat.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2.5 py-1.5 rounded-xl border border-zinc-200 transition-all">
                            <span className="text-zinc-400 font-bold text-[10px]">৳</span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={val || ''}
                              placeholder="0.00"
                              onChange={(e) =>
                                onUpdateMemberCustomCost(
                                  member.id,
                                  cat.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800 font-bold text-xs p-0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
