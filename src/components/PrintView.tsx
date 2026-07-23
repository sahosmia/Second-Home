'use client';

import React from 'react';
import { MessCalculationSummary } from '../utils/calculations';
import { CostCategory } from '../types';

interface PrintViewProps {
  summary: MessCalculationSummary;
  categories: CostCategory[];
}

export function PrintView({ summary, categories }: PrintViewProps) {
  const { totalBazaar, totalMeals, currentMealRate, results } = summary;
  const currentDateString = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:block w-full max-w-4xl mx-auto p-8 bg-white text-zinc-900 border-0 print:border-0 print:m-0 print:p-0 transition-all font-sans">
      {/* Invoice Layout Header */}
      <div className="border-b-2 border-zinc-950 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">Second Home</h1>
          <p className="text-sm font-semibold text-zinc-600 mt-1">
            Monthly Bachelor Mess Expense & Meal Calculator
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-zinc-950 text-white text-[11px] font-bold px-3 py-1 uppercase rounded-sm mb-2">
            Official Ledger
          </span>
          <p className="text-xs text-zinc-500 font-medium">Generated: {currentDateString}</p>
        </div>
      </div>

      {/* KPI Blocks for Print */}
      <div className="grid grid-cols-3 gap-6 mb-8 bg-zinc-50 border border-zinc-200 p-5 rounded-lg text-center">
        <div>
          <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Total Mess Bazaar</p>
          <h2 className="text-xl font-bold mt-1 text-zinc-900">${totalBazaar.toFixed(2)}</h2>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Total Mess Meals</p>
          <h2 className="text-xl font-bold mt-1 text-zinc-900">{totalMeals.toFixed(1)}</h2>
        </div>
        <div>
          <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Current Meal Rate</p>
          <h2 className="text-xl font-bold mt-1 text-zinc-900">${currentMealRate.toFixed(4)}</h2>
        </div>
      </div>

      {/* Categories Information Box */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Applied Custom Categories Summary
        </h2>
        {categories.length === 0 ? (
          <p className="text-xs italic text-zinc-400">No custom adjustment categories were used for this period.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isEqual = cat.splitType === 'EQUAL';
              return (
                <div key={cat.id} className="border border-zinc-200 rounded-md p-2 bg-zinc-50/50 text-xs">
                  <div className="font-bold text-zinc-800">{cat.name}</div>
                  <div className="text-zinc-500 mt-0.5 flex justify-between">
                    <span>{cat.type} ({cat.splitType})</span>
                    {isEqual && <span className="font-semibold text-zinc-700">${(cat.totalLumpSum || 0).toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Central Calculations Audit Table */}
      <div className="mb-8">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
          Detailed Calculations Ledger
        </h2>
        <div className="border border-zinc-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-300">
                <th className="px-4 py-3 font-bold text-zinc-800">Member Name</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-right">Bazaar ($)</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-center">Meals</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-right">Meal Cost ($)</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-right">Adjustments ($)</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-right">Total Exp ($)</th>
                <th className="px-4 py-3 font-bold text-zinc-800 text-right">Balance ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {results.map(({ member, finalBalance, mealExpense, netAdjustment, totalPersonalExpense }) => {
                const isOwed = finalBalance > 0;
                const isOwes = finalBalance < 0;
                const absBalance = Math.abs(finalBalance);

                return (
                  <tr key={member.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-bold text-zinc-800">{member.name}</td>
                    <td className="px-4 py-3 text-right font-medium">${(member.bazaarAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center font-semibold">{member.totalMeals || 0}</td>
                    <td className="px-4 py-3 text-right">${mealExpense.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {netAdjustment >= 0 ? '+' : '-'}${Math.abs(netAdjustment).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">${totalPersonalExpense.toFixed(2)}</td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        isOwed ? 'text-emerald-700' : isOwes ? 'text-rose-700' : 'text-zinc-700'
                      }`}
                    >
                      {isOwed ? 'Receives' : isOwes ? 'Owes' : ''} ${absBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional print invoice footer */}
      <div className="border-t border-zinc-200 pt-6 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
        <p>This report was generated client-side inside the Second Home calculator application.</p>
        <p>© {new Date().getFullYear()} Second Home Mess Management. No DB, strictly private data safety.</p>
      </div>
    </div>
  );
}
