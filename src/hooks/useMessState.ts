import { useState, useEffect } from 'react';
import { Member, CostCategory, MemberCostInput, CostType, SplitType } from '../types';
import { Language } from '../utils/translations';

// High-fidelity preloaded default mock data
const DEFAULT_CATEGORIES: CostCategory[] = [
  { id: 'cat-rent', name: 'Room Rent', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 12000, isFixed: true },
  { id: 'cat-wifi', name: 'WiFi Bill', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 1500, isFixed: true },
  { id: 'cat-gas', name: 'Gas Bill', type: 'PLUS', splitType: 'EQUAL', totalLumpSum: 1000, isFixed: false },
  { id: 'cat-due', name: 'Old Due', type: 'PLUS', splitType: 'INDIVIDUAL', isFixed: false },
  { id: 'cat-adv', name: 'Advance Balance', type: 'MINUS', splitType: 'INDIVIDUAL', isFixed: false },
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

export type Theme = 'system' | 'light' | 'dark';

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
  const [language, setLanguage] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('system');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);


  // Effect to apply theme classes based on state
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && mediaQuery.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Load state from localStorage on client mount
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('second_home_categories');
      const savedMembers = localStorage.getItem('second_home_members');
      const savedMessName = localStorage.getItem('second_home_messName');
      const savedSelectedMonth = localStorage.getItem('second_home_selectedMonth');
      const savedLanguage = localStorage.getItem('second_home_language');
      const savedTheme = localStorage.getItem('second_home_theme');

      /* eslint-disable react-hooks/set-state-in-effect */
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedMessName) setMessName(savedMessName);
      if (savedSelectedMonth) setSelectedMonth(savedSelectedMonth);
      if (savedLanguage === 'en' || savedLanguage === 'bn') {
        setLanguage(savedLanguage as Language);
      }
      if (savedTheme === 'system' || savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme as Theme);
      }
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

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_language', language);
    } catch (e) {
      console.error('Failed to save language to localStorage', e);
    }
  }, [language, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('second_home_theme', theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage', e);
    }
  }, [theme, isLoaded]);

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

  const updateCategory = (
    id: string,
    name: string,
    type: CostType,
    splitType: SplitType,
    totalLumpSum?: number,
    memberAmounts?: { [memberId: string]: number },
    isFixed?: boolean
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              name,
              type,
              splitType,
              totalLumpSum: splitType === 'EQUAL' ? totalLumpSum : undefined,
              isFixed: isFixed ?? cat.isFixed,
            }
          : cat
      )
    );

    // If splitType is INDIVIDUAL and memberAmounts are provided, update custom costs for all members
    if (splitType === 'INDIVIDUAL' && memberAmounts) {
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          const newAmount = memberAmounts[member.id] ?? 0;
          const exists = member.customCosts.some((cc) => cc.categoryId === id);
          let newCosts;
          if (exists) {
            newCosts = member.customCosts.map((cc) =>
              cc.categoryId === id ? { ...cc, amount: newAmount } : cc
            );
          } else {
            newCosts = [...member.customCosts, { categoryId: id, amount: newAmount }];
          }
          return {
            ...member,
            customCosts: newCosts,
          };
        })
      );
    }
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
      // Soft Reset: Keep REGULAR expenses, delete ONE_TIME (on time) ones
      // Keep totalLumpSum if isFixed is true; otherwise reset totalLumpSum to 0/undefined.
      setCategories((prevCategories) => {
        const regularCategories = prevCategories.filter((cat) => cat.occurrence !== 'ONE_TIME');
        return regularCategories.map((cat) => ({
          ...cat,
          totalLumpSum: cat.isFixed ? cat.totalLumpSum : (cat.totalLumpSum !== undefined ? 0 : undefined),
        }));
      });

      setCategories((currentCategories) => {
        const regularIds = currentCategories.map((cat) => cat.id);
        const fixedIds = currentCategories.filter((cat) => cat.isFixed).map((cat) => cat.id);
        setMembers((prevMembers) =>
          prevMembers.map((m) => ({
            ...m,
            bazaarAmount: 0,
            totalMeals: 0,
            customCosts: m.customCosts
              .filter((cc) => regularIds.includes(cc.categoryId))
              .map((cc) => ({
                ...cc,
                amount: fixedIds.includes(cc.categoryId) ? cc.amount : 0,
              })),
          }))
        );
        return currentCategories;
      });
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
    language,
    setLanguage,
    addCategory,
    removeCategory,
    updateCategory,
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
    theme,
    setTheme,
  };
}
