import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import api from '../services/api';
import { Category } from '../types';

export const useCategories = (type?: 'income' | 'expense') => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : '';
      const response = await api.get<Category[]>(`/categories${params}`);
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Category, 'id'>) => {
      const response = await api.post<{ message: string; category: Category }>('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useCategorizedData = () => {
  const incomeCategories = useCategories('income');
  const expenseCategories = useCategories('expense');

  const categorizedData = useMemo(() => {
    return {
      income: incomeCategories.data || [],
      expense: expenseCategories.data || [],
      all: [...(incomeCategories.data || []), ...(expenseCategories.data || [])],
    };
  }, [incomeCategories.data, expenseCategories.data]);

  return {
    categories: categorizedData,
    loading: incomeCategories.isLoading || expenseCategories.isLoading,
    error: incomeCategories.error || expenseCategories.error,
  };
};