import { Member, CostCategory } from '../types';

export interface CalculatedMemberResult {
  member: Member;
  adjustments: {
    categoryId: string;
    categoryName: string;
    type: 'PLUS' | 'MINUS';
    splitType: 'EQUAL' | 'INDIVIDUAL';
    amount: number; // For the individual member
    isExcluded?: boolean;
  }[];
  totalPlus: number;
  totalMinus: number;
  netAdjustment: number; // PLUS sum - MINUS sum
  mealExpense: number; // Member meals * Current Meal Rate
  totalPersonalExpense: number; // mealExpense + netAdjustment
  finalBalance: number; // bazaarAmount - totalPersonalExpense
}

export interface MessCalculationSummary {
  totalBazaar: number;
  totalMeals: number;
  currentMealRate: number;
  results: CalculatedMemberResult[];
}

/**
 * Calculates all mess figures dynamically based on state.
 * Supports splitType 'EQUAL' (auto-divided by current non-excluded member count) and 'INDIVIDUAL' values.
 */
export function calculateMessDetails(
  members: Member[],
  categories: CostCategory[]
): MessCalculationSummary {
  const totalBazaar = members.reduce((sum, m) => sum + (m.bazaarAmount || 0), 0);
  const totalMeals = members.reduce((sum, m) => sum + (m.totalMeals || 0), 0);
  
  // Calculate meal rate. Handle division by zero.
  const currentMealRate = totalMeals > 0 ? totalBazaar / totalMeals : 0;

  const results: CalculatedMemberResult[] = members.map((member) => {
    const adjustments: CalculatedMemberResult['adjustments'] = [];
    let totalPlus = 0;
    let totalMinus = 0;

    categories.forEach((category) => {
      let amount = 0;
      let isExcluded = false;

      if (category.splitType === 'EQUAL') {
        const excludedIds = category.excludedMemberIds || [];
        isExcluded = excludedIds.includes(member.id);

        if (isExcluded) {
          amount = 0;
        } else {
          // Count only non-excluded members
          const includedCount = members.filter((m) => !excludedIds.includes(m.id)).length;
          const lumpSum = category.totalLumpSum || 0;
          amount = includedCount > 0 ? lumpSum / includedCount : 0;
        }
      } else {
        // INDIVIDUAL: find member's specific cost for this category
        const input = member.customCosts.find((c) => c.categoryId === category.id);
        amount = input ? input.amount : 0;
      }

      if (category.type === 'PLUS') {
        totalPlus += amount;
      } else {
        totalMinus += amount;
      }

      adjustments.push({
        categoryId: category.id,
        categoryName: category.name,
        type: category.type,
        splitType: category.splitType,
        amount,
        isExcluded,
      });
    });

    const netAdjustment = totalPlus - totalMinus;
    const mealExpense = (member.totalMeals || 0) * currentMealRate;
    const totalPersonalExpense = mealExpense + netAdjustment;
    const finalBalance = (member.bazaarAmount || 0) - totalPersonalExpense;

    return {
      member,
      adjustments,
      totalPlus,
      totalMinus,
      netAdjustment,
      mealExpense,
      totalPersonalExpense,
      finalBalance,
    };
  });

  return {
    totalBazaar,
    totalMeals,
    currentMealRate,
    results,
  };
}
