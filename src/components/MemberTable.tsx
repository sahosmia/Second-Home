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
      <div className="bg-zinc-50 border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-500" />
          <h2 className="text-lg font-bold text-zinc-800">Mess Members Ledger</h2>
        </div>
        <span className="text-xs font-semibold bg-zinc-200/60 text-zinc-600 px-2.5 py-1 rounded-full">
          {members.length} {members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Member Form */}
        <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-zinc-50/50 p-4 border border-zinc-100 rounded-xl">
          <div className="md:col-span-12">
            <h3 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Add New Mess Member
            </h3>
            {error && (
              <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>
            )}
          </div>

          <div className="md:col-span-5">
            <label htmlFor="member-name" className="block text-xs font-bold text-zinc-600 uppercase mb-1">
              Full Name
            </label>
            <input
              id="member-name"
              type="text"
              placeholder="e.g. Kabir Roy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-400 bg-white"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="member-bazaar" className="block text-xs font-bold text-zinc-600 uppercase mb-1">
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
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="member-meals" className="block text-xs font-bold text-zinc-600 uppercase mb-1">
              Total Meals Eaten
            </label>
            <input
              id="member-meals"
              type="number"
              min="0"
              step="any"
              placeholder="0.0"
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              className="w-full px-3 py-1.5 border border-zinc-300 rounded-lg text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        {/* Dynamic Horizontal Scrolling Ledger Table */}
        {members.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-150 rounded-xl text-zinc-400">
            <Users className="w-12 h-12 mx-auto stroke-1 text-zinc-300 mb-2" />
            <p className="text-sm font-semibold">No members in the ledger.</p>
            <p className="text-xs">Add standard template examples above, or create custom members manually.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-150 rounded-xl shadow-xs">
            <table className="w-full border-collapse text-left text-sm text-zinc-600">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150">
                  <th scope="col" className="px-6 py-4 font-bold text-zinc-700 min-w-[200px]">
                    Member Details
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold text-zinc-700 text-center min-w-[140px]">
                    Bazaar Contribution ($)
                  </th>
                  <th scope="col" className="px-6 py-4 font-bold text-zinc-700 text-center min-w-[110px]">
                    Meals Eaten
                  </th>

                  {/* Render Columns dynamically for each individual custom cost input */}
                  {individualCategories.map((cat) => (
                    <th
                      key={cat.id}
                      scope="col"
                      className="px-6 py-4 font-bold text-zinc-700 text-center min-w-[150px]"
                    >
                      <div className="flex flex-col items-center">
                        <span>{cat.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1 rounded-sm mt-0.5 uppercase ${
                            cat.type === 'PLUS'
                              ? 'bg-emerald-100 text-emerald-850'
                              : 'bg-rose-100 text-rose-850'
                          }`}
                        >
                          {cat.type} (Indiv)
                        </span>
                      </div>
                    </th>
                  ))}

                  <th scope="col" className="px-6 py-4 text-center min-w-[80px]">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => onUpdateMemberBasic(member.id, 'name', e.target.value)}
                        className="font-bold text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 px-1 py-0.5 w-full text-sm rounded-xs"
                      />
                    </td>

                    {/* Bazaar */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 max-w-[130px] mx-auto">
                        <span className="text-zinc-400 font-semibold">$</span>
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
                          className="w-full text-center bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 text-zinc-850 font-semibold text-sm"
                        />
                      </div>
                    </td>

                    {/* Meals */}
                    <td className="px-6 py-4 text-center">
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
                        className="w-16 text-center bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 text-zinc-850 font-semibold text-sm mx-auto block"
                      />
                    </td>

                    {/* Custom Costs individual values */}
                    {individualCategories.map((cat) => {
                      const costInput = member.customCosts.find((c) => c.categoryId === cat.id);
                      const val = costInput ? costInput.amount : 0;

                      return (
                        <td key={cat.id} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 max-w-[130px] mx-auto">
                            <span className="text-zinc-400 font-semibold">$</span>
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
                              className="w-full text-center bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-emerald-500 focus:outline-none focus:ring-0 text-zinc-850 text-sm font-medium"
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Delete Member */}
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-zinc-440 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={`Delete ${member.name}`}
                      >
                        <Trash className="w-4 h-4" />
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
