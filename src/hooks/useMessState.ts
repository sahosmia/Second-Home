import { useState, useEffect } from 'react';
import { Member, CostCategory, MemberCostInput } from '../types';

// High-fidelity preloaded default mock data
const DEFAULT_CATEGORIES: CostCategory[] = [
  { id: 'cat-rent', name: 'Room Rent', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 12000 },
  { id: 'cat-wifi', name: 'WiFi Bill', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 1500 },
  { id: 'cat-gas', name: 'Gas Bill', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 1000 },
  { id: 'cat-due', name: 'Old Due', type: 'PLUS', splitType: 'INDIVIDUAL' },
  { id: 'cat-adv', name: 'Advance Balance', type: 'MINUS', splitType: 'INDIVIDUAL' },
];

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Aarav Sharma',
    bazaarAmount: 4500,
    totalMeals: 42,
    customCosts: [
      { categoryId: 'cat-due', amount: 500 },
      { categoryId: 'cat-adv', amount: 0 },
    ],
  },
  {
    id: 'm-2',
    name: 'Kabir Verma',
    bazaarAmount: 6000,
    totalMeals: 45,
    customCosts: [
      { categoryId: 'cat-due', amount: 0 },
      { categoryId: 'cat-adv', amount: 1000 },
    ],
  },
  {
    id: 'm-3',
    name: 'Ishaan Patel',
    bazaarAmount: 3000,
    totalMeals: 38,
    customCosts: [
      { categoryId: 'cat-due', amount: 150 },
      { categoryId: 'cat-adv', amount: 200 },
    ],
  },
  {
    id: 'm-4',
    name: 'Ananya Iyer',
    bazaarAmount: 5500,
    totalMeals: 40,
    customCosts: [
      { categoryId: 'cat-due', amount: 0 },
      { categoryId: 'cat-adv', amount: 0 },
    ],
  },
];

export function useMessState() {
  const [categories, setCategories] = useState<CostCategory[]>(DEFAULT_CATEGORIES);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);

  // Hook beforeunload to prevent accidental browser refresh or page close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // standard modern specification requires returning a string or setting returnValue
      e.returnValue = 'You have unsaved changes. Are you sure you want to exit?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Category Management Operations
  const addCategory = (category: Omit<CostCategory, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCategory: CostCategory = { ...category, id };

    setCategories((prev) => [...prev, newCategory]);

    // Initialize custom cost values for INDIVIDUAL split categories in current members
    if (category.splitType === 'INDIVIDUAL') {
      setMembers((prevMembers) =>
        prevMembers.map((member) => ({
          ...member,
          customCosts: [...member.customCosts, { categoryId: id, amount: 0 }],
        }))
      );
    }
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    // Remove individual inputs mapping to this deleted category from all members
    setMembers((prevMembers) =>
      prevMembers.map((member) => ({
        ...member,
        customCosts: member.customCosts.filter((cost) => cost.categoryId !== id),
      }))
    );
  };

  const updateCategoryLumpSum = (id: string, totalLumpSum: number) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, totalLumpSum } : cat))
    );
  };

  // Member Management Operations
  const addMember = (name: string, bazaarAmount: number, totalMeals: number) => {
    const id = `m-${Date.now()}`;

    // Create custom cost inputs for all INDIVIDUAL categories
    const customCosts: MemberCostInput[] = categories
      .filter((cat) => cat.splitType === 'INDIVIDUAL')
      .map((cat) => ({
        categoryId: cat.id,
        amount: 0,
      }));

    const newMember: Member = {
      id,
      name,
      bazaarAmount,
      totalMeals,
      customCosts,
    };

    setMembers((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMemberBasic = (id: string, field: 'name' | 'bazaarAmount' | 'totalMeals', value: string | number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          [field]: value,
        };
      })
    );
  };

  const updateMemberCustomCost = (memberId: string, categoryId: string, amount: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const exists = m.customCosts.some((cc) => cc.categoryId === categoryId);
        let newCosts: MemberCostInput[];

        if (exists) {
          newCosts = m.customCosts.map((cc) =>
            cc.categoryId === categoryId ? { ...cc, amount } : cc
          );
        } else {
          newCosts = [...m.customCosts, { categoryId, amount }];
        }

        return {
          ...m,
          customCosts: newCosts,
        };
      })
    );
  };

  const clearAllData = () => {
    setCategories([]);
    setMembers([]);
  };

  const resetToDefault = () => {
    setCategories(DEFAULT_CATEGORIES);
    setMembers(DEFAULT_MEMBERS);
  };

  return {
    categories,
    members,
    addCategory,
    removeCategory,
    updateCategoryLumpSum,
    addMember,
    removeMember,
    updateMemberBasic,
    updateMemberCustomCost,
    clearAllData,
    resetToDefault,
  };
}
