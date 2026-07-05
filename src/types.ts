/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  uid: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: string; // ISO string
}

export interface Budget {
  id: string; // uid_YYYY-MM
  uid: string;
  month: string; // YYYY-MM
  limit: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind background color
  textColor: string; // Tailwind text color
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgetProgress: number; // percentage
  remainingBudget: number;
}
