export type UserRole = 'admin' | 'user' | 'read-only';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export interface MonthlyOverview {
  overview: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
  };
  dailyData: Array<{
    date: string;
    income: number;
    expense: number;
  }>;
}

export interface CategoryBreakdown {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  total: number;
  count: number;
  percentage: number;
}

export interface YearlyTrends {
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
}

export interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}