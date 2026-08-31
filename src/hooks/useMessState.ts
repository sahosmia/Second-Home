import { useState, useEffect, useMemo } from 'react';
import { Member, CostCategory, MemberCostInput, CostType, SplitType, ExpenseOccurrence } from '../types';
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

interface MonthData {
  categories: CostCategory[];
  members: Member[];
}

const STORAGE_KEY_MONTHLY = 'second_home_monthly_data';

/**
 * Carries a month's REGULAR (non one-time) categories forward into a fresh
 * settlement period: fixed lump sums/custom costs persist, everything else
 * (bazaar, meals, variable amounts) resets to 0/undefined for the new period.
 * Reused both for month-rollover (viewing an unstarted month) and the
 * in-place "Soft Reset" action on the currently open month.
 */
function buildFreshMonthFrom(prior: MonthData): MonthData {
  const regularCategories = prior.categories.filter((cat) => cat.occurrence !== 'ONE_TIME');
  const newCategories = regularCategories.map((cat) => ({
    ...cat,
    totalLumpSum: cat.isFixed ? cat.totalLumpSum : (cat.totalLumpSum !== undefined ? 0 : undefined),
    // Notes (e.g. "old meter unit 1234") are period-specific and never carry into a new month
    note: undefined,
  }));
  const regularIds = newCategories.map((cat) => cat.id);
  const fixedIds = newCategories.filter((cat) => cat.isFixed).map((cat) => cat.id);

  const newMembers = prior.members.map((m) => ({
    ...m,
    bazaarAmount: 0,
    totalMeals: 0,
    customCosts: m.customCosts
      .filter((cc) => regularIds.includes(cc.categoryId))
      .map((cc) => ({
        ...cc,
        amount: fixedIds.includes(cc.categoryId) ? cc.amount : 0,
      })),
  }));

  return { categories: newCategories, members: newMembers };
}

// Date.now() alone collides when two entities are created in the same millisecond
// (e.g. a "quick add" button firing two addCategory calls back to back), which
// silently merges them into one shared id downstream. A random suffix rules that out.
let idCounter = 0;
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * One-time repair for data saved before generateId() existed, when two categories
 * created in the same millisecond could end up sharing an id (React key warnings,
 * and editing one category's per-member amount silently editing the other's too).
 * Keeps the first category with a given id as-is and reassigns fresh ids to any
 * later duplicates, then realigns each member's customCosts entries — which were
 * pushed in the same order categories were created — to match.
 */
function deduplicateMonthIds(month: MonthData): MonthData {
  const oldIdToNewIds = new Map<string, string[]>();
  const newCategories = month.categories.map((cat) => {
    const assigned = oldIdToNewIds.get(cat.id) ?? [];
    const newId = assigned.length === 0 ? cat.id : generateId('cat');
    assigned.push(newId);
    oldIdToNewIds.set(cat.id, assigned);
    return assigned.length === 1 ? cat : { ...cat, id: newId };
  });

  const hasDuplicates = [...oldIdToNewIds.values()].some((ids) => ids.length > 1);
  if (!hasDuplicates) return month;

  const newMembers = month.members.map((m) => {
    const occurrenceCounters = new Map<string, number>();
    const newCustomCosts = m.customCosts.map((cc) => {
      const idsForCategory = oldIdToNewIds.get(cc.categoryId);
      if (!idsForCategory || idsForCategory.length <= 1) return cc;
      const occurrence = occurrenceCounters.get(cc.categoryId) ?? 0;
      occurrenceCounters.set(cc.categoryId, occurrence + 1);
      const newId = idsForCategory[Math.min(occurrence, idsForCategory.length - 1)];
      return newId === cc.categoryId ? cc : { ...cc, categoryId: newId };
    });
    return { ...m, customCosts: newCustomCosts };
  });

  return { categories: newCategories, members: newMembers };
}

/** Returns the saved data for a month, or synthesizes a fresh start carried forward from the nearest prior month. */
function resolveMonth(monthKey: string, allMonths: Record<string, MonthData>): MonthData {
  if (allMonths[monthKey]) return allMonths[monthKey];

  const existingKeys = Object.keys(allMonths).sort();
  if (existingKeys.length === 0) {
    return { categories: DEFAULT_CATEGORIES, members: [] };
  }

  const priorKeys = existingKeys.filter((k) => k < monthKey);
  const baseKey = priorKeys.length > 0 ? priorKeys[priorKeys.length - 1] : existingKeys[0];
  return buildFreshMonthFrom(allMonths[baseKey]);
}

export function useMessState() {
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>({});
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

  // Derived read-only view of the currently selected month (synthesized on the fly if not yet persisted)
  const currentMonth = useMemo(
    () => resolveMonth(selectedMonth, monthlyData),
    [selectedMonth, monthlyData]
  );
  const categories = currentMonth.categories;
  const members = currentMonth.members;

  // Applies an updater to the currently selected month, materializing it first if it doesn't exist yet
  const updateCurrentMonth = (updater: (month: MonthData) => MonthData) => {
    setMonthlyData((prev) => {
      const existing = prev[selectedMonth] ?? resolveMonth(selectedMonth, prev);
      return { ...prev, [selectedMonth]: updater(existing) };
    });
  };

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
      const savedMonthly = localStorage.getItem(STORAGE_KEY_MONTHLY);
      const savedMessName = localStorage.getItem('second_home_messName');
      const savedSelectedMonth = localStorage.getItem('second_home_selectedMonth');
      const savedLanguage = localStorage.getItem('second_home_language');
      const savedTheme = localStorage.getItem('second_home_theme');

      /* eslint-disable react-hooks/set-state-in-effect */
      if (savedMonthly) {
        const parsed: Record<string, MonthData> = JSON.parse(savedMonthly);
        const repaired = Object.fromEntries(
          Object.entries(parsed).map(([monthKey, data]) => [monthKey, deduplicateMonthIds(data)])
        );
        setMonthlyData(repaired);
      } else {
        // One-time migration from the pre-month-wise storage format
        const legacyCategories = localStorage.getItem('second_home_categories');
        const legacyMembers = localStorage.getItem('second_home_members');
        if (legacyCategories || legacyMembers) {
          const monthKey = savedSelectedMonth || getCurrentMonthYear();
          setMonthlyData({
            [monthKey]: deduplicateMonthIds({
              categories: legacyCategories ? JSON.parse(legacyCategories) : DEFAULT_CATEGORIES,
              members: legacyMembers ? JSON.parse(legacyMembers) : [],
            }),
          });
          localStorage.removeItem('second_home_categories');
          localStorage.removeItem('second_home_members');
        }
      }

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
      localStorage.setItem(STORAGE_KEY_MONTHLY, JSON.stringify(monthlyData));
    } catch (e) {
      console.error('Failed to save monthly data to localStorage', e);
    }
  }, [monthlyData, isLoaded]);

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

  // Category Management Operations (scoped to the currently selected month)
  const addCategory = (
    category: Omit<CostCategory, 'id'>,
    initialMemberAmounts?: { [memberId: string]: number }
  ) => {
    const id = generateId('cat');
    const newCategory: CostCategory = { ...category, id };

    updateCurrentMonth((month) => ({
      categories: [...month.categories, newCategory],
      members: month.members.map((member) => {
        const initialAmount = initialMemberAmounts?.[member.id] || 0;
        return {
          ...member,
          customCosts: [...member.customCosts, { categoryId: id, amount: initialAmount }],
        };
      }),
    }));
  };

  const removeCategory = (id: string) => {
    updateCurrentMonth((month) => ({
      categories: month.categories.filter((cat) => cat.id !== id),
      members: month.members.map((member) => ({
        ...member,
        customCosts: member.customCosts.filter((cost) => cost.categoryId !== id),
      })),
    }));
  };

  const updateCategoryLumpSum = (id: string, totalLumpSum: number) => {
    updateCurrentMonth((month) => ({
      ...month,
      categories: month.categories.map((cat) => (cat.id === id ? { ...cat, totalLumpSum } : cat)),
    }));
  };

  const updateCategory = (
    id: string,
    name: string,
    type: CostType,
    splitType: SplitType,
    totalLumpSum?: number,
    memberAmounts?: { [memberId: string]: number },
    occurrence?: ExpenseOccurrence,
    isFixed?: boolean,
    note?: string
  ) => {
    updateCurrentMonth((month) => {
      const newCategories = month.categories.map((cat) =>
        cat.id === id
          ? {
              ...cat,
              name,
              type,
              splitType,
              totalLumpSum: splitType === 'EQUAL' ? totalLumpSum : undefined,
              occurrence: occurrence ?? cat.occurrence,
              isFixed: isFixed ?? cat.isFixed,
              note: note?.trim() ? note.trim() : undefined,
            }
          : cat
      );

      let newMembers = month.members;
      if (splitType === 'INDIVIDUAL' && memberAmounts) {
        newMembers = month.members.map((member) => {
          const newAmount = memberAmounts[member.id] ?? 0;
          const exists = member.customCosts.some((cc) => cc.categoryId === id);
          const newCosts: MemberCostInput[] = exists
            ? member.customCosts.map((cc) =>
                cc.categoryId === id ? { ...cc, amount: newAmount } : cc
              )
            : [...member.customCosts, { categoryId: id, amount: newAmount }];
          return { ...member, customCosts: newCosts };
        });
      }

      return { categories: newCategories, members: newMembers };
    });
  };

  const toggleCategoryMemberExclusion = (categoryId: string, memberId: string) => {
    updateCurrentMonth((month) => ({
      ...month,
      categories: month.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const currentExclusions = cat.excludedMemberIds || [];
        const isExcluded = currentExclusions.includes(memberId);
        const newExclusions = isExcluded
          ? currentExclusions.filter((mid) => mid !== memberId)
          : [...currentExclusions, memberId];
        return {
          ...cat,
          excludedMemberIds: newExclusions,
        };
      }),
    }));
  };

  // Member Management Operations (scoped to the currently selected month)
  const addMember = (
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    initialCustomCosts?: { categoryId: string; amount: number }[]
  ) => {
    const id = generateId('m');

    updateCurrentMonth((month) => {
      const customCosts: MemberCostInput[] = month.categories
        .filter((cat) => cat.splitType === 'INDIVIDUAL')
        .map((cat) => {
          const found = initialCustomCosts?.find((icc) => icc.categoryId === cat.id);
          return {
            categoryId: cat.id,
            amount: found ? found.amount : 0,
          };
        });

      const newMember: Member = { id, name, bazaarAmount, totalMeals, customCosts };
      return { ...month, members: [...month.members, newMember] };
    });
  };

  const removeMember = (id: string) => {
    updateCurrentMonth((month) => ({
      ...month,
      members: month.members.filter((m) => m.id !== id),
    }));
  };

  const updateMemberBasic = (id: string, field: 'name' | 'bazaarAmount' | 'totalMeals', value: string | number) => {
    updateCurrentMonth((month) => ({
      ...month,
      members: month.members.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const updateMemberCustomCost = (memberId: string, categoryId: string, amount: number) => {
    updateCurrentMonth((month) => ({
      ...month,
      members: month.members.map((m) => {
        if (m.id !== memberId) return m;

        const exists = m.customCosts.some((cc) => cc.categoryId === categoryId);
        const newCosts: MemberCostInput[] = exists
          ? m.customCosts.map((cc) => (cc.categoryId === categoryId ? { ...cc, amount } : cc))
          : [...m.customCosts, { categoryId, amount }];

        return { ...m, customCosts: newCosts };
      }),
    }));
  };

  const updateMemberFull = (
    id: string,
    name: string,
    bazaarAmount: number,
    totalMeals: number,
    customCosts: { categoryId: string; amount: number }[]
  ) => {
    updateCurrentMonth((month) => ({
      ...month,
      members: month.members.map((m) =>
        m.id === id ? { ...m, name, bazaarAmount, totalMeals, customCosts } : m
      ),
    }));
  };

  const clearAllData = (isHard = false) => {
    if (isHard) {
      // Hard Reset: Wipe every month's history, remove local storage, and reset mess name
      setMonthlyData({});
      setMessName('Second Home');
      try {
        localStorage.removeItem(STORAGE_KEY_MONTHLY);
        localStorage.removeItem('second_home_messName');
        localStorage.removeItem('second_home_selectedMonth');
      } catch (e) {
        console.error('Failed to clear localStorage', e);
      }
    } else {
      // Soft Reset: Re-run the same month-rollover logic in place on the currently open month —
      // keeps REGULAR/fixed categories, drops ONE_TIME ones, zeroes out variable amounts.
      updateCurrentMonth((month) => buildFreshMonthFrom(month));
    }
  };

  const resetToDefault = () => {
    // Restores the demo template into the currently viewed month only — other months' history is untouched.
    updateCurrentMonth(() => ({ categories: DEFAULT_CATEGORIES, members: DEFAULT_MEMBERS }));
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
