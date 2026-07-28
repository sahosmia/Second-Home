export type CostType = 'PLUS' | 'MINUS';
export type SplitType = 'EQUAL' | 'INDIVIDUAL';
export type ExpenseOccurrence = 'REGULAR' | 'ONE_TIME';

export interface CostCategory {
  id: string;
  name: string;
  type: CostType;
  splitType: SplitType;
  totalLumpSum?: number; // Used if splitType is 'EQUAL'
  excludedMemberIds?: string[]; // IDs of members excluded from EQUAL split
  occurrence?: ExpenseOccurrence; // REGULAR (recurring/always stays on clear) or ONE_TIME
  isFixed?: boolean; // Whether the cost value stays on soft reset
}

export interface MemberCostInput {
  categoryId: string;
  amount: number;
}

export interface Member {
  id: string;
  name: string;
  bazaarAmount: number;
  totalMeals: number;
  customCosts: MemberCostInput[];
}
