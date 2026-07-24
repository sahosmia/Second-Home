'use client';

import React, { useState } from 'react';
import { Member, CostCategory } from '../types';
import { Users, Plus, Trash, Sparkles } from 'lucide-react';

interface MemberTableProps {
  members: Member[];
  categories: CostCategory[];
  onAddMember: (name: string, bazaarAmount: number, totalMeals: number) => void;
  onRemoveMember: (id: string) => void;
  onUpdateMemberBasic: (id: string, field: 'name' | 'bazaarAmount' | 'totalMeals', value: string | number) => void;
  onUpdateMemberCustomCost: (memberId: string, categoryId: string, amount: number) => void;
}

export function MemberTable({
  members,
  categories,
  onAddMember,
  onRemoveMember,
  onUpdateMemberBasic,
  onUpdateMemberCustomCost,
}: MemberTableProps) {
  const [name, setName] = useState<string>('');
  const [bazaar, setBazaar] = useState<string>('');
  const [meals, setMeals] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }

    const bazaarAmount = parseFloat(bazaar) || 0;
    const totalMeals = parseFloat(meals) || 0;

    onAddMember(name.trim(), bazaarAmount, totalMeals);

    setName('');
    setBazaar('');
    setMeals('');
    setError('');
  };

  const individualCategories = categories.filter((cat) => cat.splitType === 'INDIVIDUAL');

  return (
    <section className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden transition-all print:hidden">
      {/* Table Header */}
      <div className="bg-zinc-50 border-b border-zinc-150 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-500 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-zinc-800">Mess Members Ledger</h2>
        </div>
        <span className="self-start sm:self-auto text-xs font-semibold bg-zinc-200/70 text-zinc-700 px-3 py-1 rounded-full">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Add Member Form */}
        <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-zinc-50/50 p-4 border border-zinc-150 rounded-2xl">
          <div className="md:col-span-12">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" /> Add New Mess Member
            </h3>
            {error && (
              <p className="text-xs text-rose-600 font-bold mt-1">{error}</p>
            )}
          </div>

          <div className="md:col-span-5">
            <label htmlFor="member-name" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              Full Name
            </label>
            <input
              id="member-name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-400 bg-white font-medium transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="member-bazaar" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              Bazaar Contribution ($)
            </label>
            <input
              id="member-bazaar"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={bazaar}
              onChange={(e) => setBazaar(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="member-meals" className="block text-xs font-bold text-zinc-600 uppercase mb-1.5">
              Meals Eaten
            </label>
            <input
              id="member-meals"
              type="number"
              min="0"
              step="any"
              placeholder="0.0"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              className="w-full px-3.5 py-2 border border-zinc-300 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer active:scale-98 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </form>

        {/* Dynamic Horizontal Scrolling Ledger Table */}
        {members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
            <Users className="w-12 h-12 mx-auto stroke-1 text-zinc-300 mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No Members Added Yet</p>
            <p className="text-xs max-w-xs mx-auto mt-1 leading-relaxed">Fill the parameters above or load demo configurations to see the live math spreadsheet ledger.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-2xs">
            <table className="w-full border-collapse text-left text-sm text-zinc-650 min-w-[750px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase tracking-wider font-extrabold text-zinc-500">
                  <th scope="col" className="px-6 py-4 min-w-[180px]">
                    Member Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-center min-w-[140px]">
                    Bazaar Deposit ($)
                  </th>
                  <th scope="col" className="px-6 py-4 text-center min-w-[110px]">
                    Meals Eaten
                  </th>

                  {/* Dynamic Individual Custom Category Columns */}
                  {individualCategories.map((cat) => (
                    <th
                      key={cat.id}
                      scope="col"
                      className="px-6 py-4 text-center min-w-[140px]"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-zinc-600">{cat.name}</span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-sm mt-1 uppercase tracking-tight ${
                            cat.type === 'PLUS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {cat.type}
                        </span>
                      </div>
                    </th>
                  ))}

                  <th scope="col" className="px-6 py-4 text-center w-[60px]">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 bg-white">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50/40 transition-colors group">
                    {/* Name */}
                    <td className="px-6 py-4.5">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => onUpdateMemberBasic(member.id, 'name', e.target.value)}
                        className="font-extrabold text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 px-1 py-0.5 w-full text-sm rounded-sm transition-all"
                      />
                    </td>

                    {/* Bazaar */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center gap-1 max-w-[110px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2.5 py-1 rounded-lg border border-zinc-200 transition-all">
                        <span className="text-zinc-400 font-bold text-xs">$</span>
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
                          className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-850 font-extrabold text-sm p-0"
                        />
                      </div>
                    </td>

                    {/* Meals */}
                    <td className="px-6 py-4.5 text-center">
                      <div className="flex items-center justify-center max-w-[80px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2 py-1 rounded-lg border border-zinc-200 transition-all">
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
                          className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-850 font-extrabold text-sm p-0"
                        />
                      </div>
                    </td>

                    {/* Individual Dynamic Categories */}
                    {individualCategories.map((cat) => {
                      const costInput = member.customCosts.find((c) => c.categoryId === cat.id);
                      const val = costInput ? costInput.amount : 0;

                      return (
                        <td key={cat.id} className="px-6 py-4.5 text-center">
                          <div className="flex items-center justify-center gap-1 max-w-[110px] mx-auto bg-zinc-50/50 hover:bg-zinc-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 px-2.5 py-1 rounded-lg border border-zinc-200 transition-all">
                            <span className="text-zinc-450 font-semibold text-xs">$</span>
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
                              className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-800 text-sm font-semibold p-0"
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Delete Action button */}
                    <td className="px-6 py-4.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        title={`Delete ${member.name}`}
                      >
                        <Trash className="w-4 h-4 shrink-0" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
