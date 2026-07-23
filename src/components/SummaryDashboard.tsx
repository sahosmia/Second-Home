'use client';

import React from 'react';
import { MessCalculationSummary } from '../utils/calculations';
import { ShoppingBag, Utensils, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryDashboardProps {
  summary: MessCalculationSummary;
}

export function SummaryDashboard({ summary }: SummaryDashboardProps) {
  const { totalBazaar, totalMeals, currentMealRate, results } = summary;

  return (
    <section className="space-y-6 print:hidden">
      {/* 3-Column Top KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bazaar */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-5 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Mess Bazaar</p>
            <h3 className="text-2xl font-extrabold text-zinc-850 mt-1">${totalBazaar.toFixed(2)}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Sum of all bazaar deposits</p>
          </div>
        </div>

        {/* Total Meals */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-5 shadow-xs transition-transform hover:-translate-y-0.5">
          <div className="p-4 bg-amber-500/10 text-amber-600 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Mess Meals</p>
            <h3 className="text-2xl font-extrabold text-zinc-850 mt-1">{totalMeals.toFixed(1)}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Aggregate meals consumed</p>
          </div>
        </div>

        {/* Current Meal Rate */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-5 shadow-xs transition-transform hover:-translate-y-0.5 relative overflow-hidden">
          <div className="p-4 bg-emerald-600/10 text-emerald-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Current Meal Rate</p>
            <h3 className="text-2xl font-extrabold text-zinc-850 mt-1">
              ${currentMealRate.toFixed(4)}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Total Bazaar / Total Meals</p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-transparent to-zinc-50/50 pointer-events-none" />
        </div>
      </div>

      {/* Settlement Cards Section */}
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">
          Individual Balance & Settlement Sheets
        </h3>

        {results.length === 0 ? (
          <div className="text-center py-8 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-400 text-sm font-semibold">
            Add members to view individual balance calculations.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map(({ member, finalBalance, mealExpense, netAdjustment, totalPersonalExpense }) => {
              const isOwed = finalBalance > 0;
              const isOwes = finalBalance < 0;
              const absBalance = Math.abs(finalBalance);

              return (
                <div
                  key={member.id}
                  className={`border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all bg-white hover:shadow-md ${
                    isOwed
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : isOwes
                      ? 'border-rose-200 hover:border-rose-300'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    {/* Header Name & Settlement Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-zinc-800 text-base leading-tight break-words max-w-[70%]">
                        {member.name || 'Unnamed Member'}
                      </h4>
                      {isOwed && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                          <TrendingUp className="w-3 h-3" /> Receives
                        </span>
                      )}
                      {isOwes && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">
                          <TrendingDown className="w-3 h-3" /> Owes
                        </span>
                      )}
                      {!isOwed && !isOwes && (
                        <span className="text-[10px] font-extrabold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full uppercase">
                          Settle-0
                        </span>
                      )}
                    </div>

                    {/* Final Net Amount Display */}
                    <div className="mt-4">
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                        Settlement Balance
                      </p>
                      <h5
                        className={`text-2xl font-black tracking-tight mt-0.5 ${
                          isOwed
                            ? 'text-emerald-600'
                            : isOwes
                            ? 'text-rose-600'
                            : 'text-zinc-700'
                        }`}
                      >
                        {isOwed ? '+' : isOwes ? '-' : ''}${absBalance.toFixed(2)}
                      </h5>
                    </div>

                    {/* Expanded Costs Breakdown */}
                    <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 text-xs">
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Bazaar Deposit:</span>
                        <span className="font-bold text-zinc-700">${(member.bazaarAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Meals ({member.totalMeals || 0}):</span>
                        <span className="font-bold text-zinc-700">${mealExpense.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Adjustments ($A_i$):</span>
                        <span className={`font-bold ${netAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {netAdjustment >= 0 ? '+' : '-'}${Math.abs(netAdjustment).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box Footer */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 bg-zinc-50 -mx-5 -mb-5 px-5 py-3 rounded-b-xl flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase">Total Expense</span>
                    <span className="text-xs font-bold text-zinc-800">${totalPersonalExpense.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
