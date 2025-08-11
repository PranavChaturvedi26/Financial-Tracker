import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import api from '../services/api';
import { Transaction, PaginatedResponse } from '../types';

interface TransactionFilters {
  page?: number;
  limit?: number;
  category?: number;
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useTransactions = (filters: TransactionFilters = {}) => {
  const queryKey = useMemo(() => ['transactions', filters], [filters]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      const response = await api.get<PaginatedResponse<Transaction>>(`/transactions?${params}`);
      return response.data;
    },
  });
};

export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const response = await api.get<Transaction>(`/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const response = await api.post<{ message: string; transaction: Transaction }>('/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: number }) => {
      const response = await api.put<{ message: string; transaction: Transaction }>(`/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useFilteredTransactions = (initialFilters: TransactionFilters = {}) => {
  const queryClient = useQueryClient();

  const prefetchNextPage = useCallback(
    async (currentPage: number) => {
      const nextPage = currentPage + 1;
      await queryClient.prefetchQuery({
        queryKey: ['transactions', { ...initialFilters, page: nextPage }],
        queryFn: async () => {
          const params = new URLSearchParams();
          Object.entries({ ...initialFilters, page: nextPage }).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, String(value));
            }
          });
          const response = await api.get<PaginatedResponse<Transaction>>(`/transactions?${params}`);
          return response.data;
        },
      });
    },
    [queryClient, initialFilters]
  );

  return { prefetchNextPage };
};