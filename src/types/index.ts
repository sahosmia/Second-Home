export type CostType = 'PLUS' | 'MINUS';
export type SplitType = 'EQUAL' | 'INDIVIDUAL';

export interface CostCategory {
  id: string;
  name: string;
  type: CostType;
  splitType: SplitType;
  totalLumpSum?: number; // Used if splitType is 'EQUAL'
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
