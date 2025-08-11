import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '../services/api';
import { MonthlyOverview, CategoryBreakdown, YearlyTrends, Transaction } from '../types';

export const useMonthlyOverview = (year?: number, month?: number) => {
  const currentDate = new Date();
  const queryYear = year || currentDate.getFullYear();
  const queryMonth = month || currentDate.getMonth() + 1;

  return useQuery({
    queryKey: ['analytics', 'monthly', queryYear, queryMonth],
    queryFn: async () => {
      const response = await api.get<MonthlyOverview>('/analytics/monthly', {
        params: { year: queryYear, month: queryMonth }
      });
      return response.data;
    },
  });
};

export const useCategoryBreakdown = (type: 'income' | 'expense' = 'expense', startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['analytics', 'categories', type, startDate, endDate],
    queryFn: async () => {
      const response = await api.get<CategoryBreakdown[]>('/analytics/categories', {
        params: { type, startDate, endDate }
      });
      return response.data;
    },
  });
};

export const useYearlyTrends = (year?: number) => {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['analytics', 'yearly', currentYear],
    queryFn: async () => {
      const response = await api.get<YearlyTrends>('/analytics/yearly', {
        params: { year: currentYear }
      });
      return response.data;
    },
  });
};

export const useRecentTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['analytics', 'recent', limit],
    queryFn: async () => {
      const response = await api.get<Transaction[]>('/analytics/recent', {
        params: { limit }
      });
      return response.data;
    },
  });
};

export const useAnalyticsSummary = () => {
  const monthlyOverview = useMonthlyOverview();
  const expenseBreakdown = useCategoryBreakdown('expense');
  const incomeBreakdown = useCategoryBreakdown('income');
  const yearlyTrends = useYearlyTrends();

  const summary = useMemo(() => {
    if (!monthlyOverview.data || !yearlyTrends.data) {
      return null;
    }

    return {
      currentMonth: monthlyOverview.data.overview,
      yearToDate: {
        income: yearlyTrends.data.totalIncome,
        expense: yearlyTrends.data.totalExpense,
        balance: yearlyTrends.data.totalBalance,
      },
      averages: {
        monthlyIncome: yearlyTrends.data.averageMonthlyIncome,
        monthlyExpense: yearlyTrends.data.averageMonthlyExpense,
      },
      topExpenseCategories: expenseBreakdown.data?.slice(0, 3) || [],
      topIncomeCategories: incomeBreakdown.data?.slice(0, 3) || [],
    };
  }, [monthlyOverview.data, yearlyTrends.data, expenseBreakdown.data, incomeBreakdown.data]);

  return {
    summary,
    loading: monthlyOverview.isLoading || yearlyTrends.isLoading,
    error: monthlyOverview.error || yearlyTrends.error,
  };
};