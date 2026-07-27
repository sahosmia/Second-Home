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
  // Set initial members state to empty as per requirements: "The initial member list MUST start empty ([])"
  const [members, setMembers] = useState<Member[]>([]);
  const [messName, setMessName] = useState<string>('Second Home');
  
  // Format current month: "YYYY-MM" (e.g. "2025-05")
  const getCurrentMonthYear = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthYear());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Hook beforeunload to prevent accidental browser refresh or page close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to exit?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('second_home_categories');
      const savedMembers = localStorage.getItem('second_home_members');
      const savedMessName = localStorage.getItem('second_home_messName');
      const savedSelectedMonth = localStorage.getItem('second_home_selectedMonth');

      /* eslint-disable react-hooks/set-state-in-effect */
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedMessName) setMessName(savedMessName);
      if (savedSelectedMonth) setSelectedMonth(savedSelectedMonth);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }

    // Smooth transition delay during loading to allow state settling and avoid layout flicker
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to localStorage after loaded
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_categories', JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_members', JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to localStorage', e);
    }
  }, [members, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_messName', messName);
    } catch (e) {
      console.error('Failed to save messName to localStorage', e);
    }
  }, [messName, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_selectedMonth', selectedMonth);
    } catch (e) {
      console.error('Failed to save selectedMonth to localStorage', e);
    }
  }, [selectedMonth, isLoaded]);

  // Category Management Operations
  const addCategory = (
    category: Omit<CostCategory, 'id'>,
    initialMemberAmounts?: { [memberId: string]: number }
  ) => {
    const id = `cat-${Date.now()}`;
    const newCategory: CostCategory = { ...category, id };
    
    setCategories((prev) => [...prev, newCategory]);

    // Initialize custom cost values for INDIVIDUAL split categories in current members
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        const initialAmount = initialMemberAmounts?.[member.id] || 0;
        return {
          ...member,
          customCosts: [...member.customCosts, { categoryId: id, amount: initialAmount }],
        };
      })
    );
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

  const toggleCategoryMemberExclusion = (categoryId: string, memberId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const currentExclusions = cat.excludedMemberIds || [];
        const isExcluded = currentExclusions.includes(memberId);
        const newExclusions = isExcluded
          ? currentExclusions.filter((id) => id !== memberId)
          : [...currentExclusions, memberId];
        return {
          ...cat,
          excludedMemberIds: newExclusions,
        };
      })
    );
  };

  // Member Management Operations
  const addMember = (
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    initialCustomCosts?: { categoryId: string; amount: number }[]
  ) => {
    const id = `m-${Date.now()}`;
    
    // Create custom cost inputs for all INDIVIDUAL categories
    const customCosts: MemberCostInput[] = categories
      .filter((cat) => cat.splitType === 'INDIVIDUAL')
      .map((cat) => {
        const found = initialCustomCosts?.find((icc) => icc.categoryId === cat.id);
        return {
          categoryId: cat.id,
          amount: found ? found.amount : 0,
        };
      });

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

  const updateMemberFull = (
    id: string,
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    customCosts: { categoryId: string; amount: number }[]
  ) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          name,
          bazaarAmount,
          totalMeals,
          customCosts,
        };
      })
    );
  };

  const clearAllData = (isHard = false) => {
    if (isHard) {
      // Hard Reset: Clear all, remove local storage, and reset mess name
      setCategories([]);
      setMembers([]);
      setMessName('Second Home');
      try {
        localStorage.removeItem('second_home_categories');
        localStorage.removeItem('second_home_members');
        localStorage.removeItem('second_home_messName');
        localStorage.removeItem('second_home_selectedMonth');
      } catch (e) {
        console.error('Failed to clear localStorage', e);
      }
    } else {
      // Soft Reset: Preserve members and categories name/type/splitType, reset numeric fields to 0
      setCategories((prevCategories) =>
        prevCategories.map((cat) => ({
          ...cat,
          totalLumpSum: cat.totalLumpSum !== undefined ? 0 : undefined,
        }))
      );
      setMembers((prevMembers) =>
        prevMembers.map((m) => ({
          ...m,
          bazaarAmount: 0,
          totalMeals: 0,
          customCosts: m.customCosts.map((cc) => ({
            ...cc,
            amount: 0,
          })),
        }))
      );
    }
  };

  const resetToDefault = () => {
    setCategories(DEFAULT_CATEGORIES);
    setMembers(DEFAULT_MEMBERS);
  };

  return {
    categories,
    members,
    messName,
    setMessName,
    selectedMonth,
    setSelectedMonth,
    addCategory,
    removeCategory,
    updateCategoryLumpSum,
    toggleCategoryMemberExclusion,
    addMember,
    removeMember,
    updateMemberBasic,
    updateMemberCustomCost,
    clearAllData,
    resetToDefault,
    isLoaded,
    updateMemberFull,
  };
}
