/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CategoryOption } from '../types';

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  {
    id: 'food',
    name: 'อาหารและเครื่องดื่ม',
    icon: 'Utensils',
    color: 'bg-orange-100 dark:bg-orange-950/40',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้งและเสื้อผ้า',
    icon: 'ShoppingBag',
    color: 'bg-pink-100 dark:bg-pink-950/40',
    textColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 'transport',
    name: 'การเดินทางและรถยนต์',
    icon: 'Car',
    color: 'bg-blue-100 dark:bg-blue-950/40',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'home',
    name: 'บ้านและที่อยู่อาศัย',
    icon: 'Home',
    color: 'bg-purple-100 dark:bg-purple-950/40',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 'utilities',
    name: 'บิล ค่าน้ำ ค่าไฟ อินเทอร์เน็ต',
    icon: 'Zap',
    color: 'bg-amber-100 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'entertainment',
    name: 'ความบันเทิงและท่องเที่ยว',
    icon: 'Tv',
    color: 'bg-indigo-100 dark:bg-indigo-950/40',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    id: 'medical',
    name: 'สุขภาพและความงาม',
    icon: 'HeartPulse',
    color: 'bg-red-100 dark:bg-red-950/40',
    textColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'education',
    name: 'การศึกษาและการเรียนรู้',
    icon: 'GraduationCap',
    color: 'bg-emerald-100 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'other_expense',
    name: 'รายจ่ายอื่นๆ',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 dark:bg-gray-850',
    textColor: 'text-gray-600 dark:text-gray-400'
  }
];

export const INCOME_CATEGORIES: CategoryOption[] = [
  {
    id: 'salary',
    name: 'เงินเดือนประจำ',
    icon: 'Briefcase',
    color: 'bg-emerald-100 dark:bg-emerald-950/40',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'business',
    name: 'ธุรกิจและการค้าขาย',
    icon: 'TrendingUp',
    color: 'bg-teal-100 dark:bg-teal-950/40',
    textColor: 'text-teal-600 dark:text-teal-400'
  },
  {
    id: 'investment',
    name: 'การลงทุนและปันผล',
    icon: 'PiggyBank',
    color: 'bg-cyan-100 dark:bg-cyan-950/40',
    textColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    id: 'side_income',
    name: 'งานพาร์ทไทม์และรายได้เสริม',
    icon: 'Sparkles',
    color: 'bg-amber-100 dark:bg-amber-950/40',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'gift',
    name: 'ของขวัญและโบนัส',
    icon: 'Gift',
    color: 'bg-violet-100 dark:bg-violet-950/40',
    textColor: 'text-violet-600 dark:text-violet-400'
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    icon: 'Coins',
    color: 'bg-green-100 dark:bg-green-950/40',
    textColor: 'text-green-600 dark:text-green-400'
  }
];

export function getCategoryById(id: string, type: 'income' | 'expense'): CategoryOption {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find(c => c.id === id);
  if (found) return found;
  
  return {
    id: 'unknown',
    name: id || 'อื่นๆ',
    icon: 'MoreHorizontal',
    color: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-500'
  };
}
