/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';
import { getCategoryById } from '../utils/categories';
import CategoryIcon from './CategoryIcon';
import { Search, SlidersHorizontal, Calendar, Trash2, Edit2, Info, ChevronDown, Check } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onSelectTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  selectedMonth: string; // YYYY-MM
}

type FilterType = 'all' | 'income' | 'expense';
type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function TransactionList({
  transactions,
  onSelectTransaction,
  onDeleteTransaction,
  selectedMonth
}: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOrder>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions
  const filtered = transactions.filter(t => {
    const isSameMonth = t.date.substring(0, 7) === selectedMonth;
    if (!isSameMonth) return false;

    const matchesFilter =
      filter === 'all' ||
      (filter === 'income' && t.type === 'income') ||
      (filter === 'expense' && t.type === 'expense');

    const catObj = getCategoryById(t.category, t.type);
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      catObj.name.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort transactions
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  // Group transactions by date for date-desc list
  // Wait, only group if we are sorting by date! If we are sorting by amount, just render a flat list.
  const isDateGroupable = sortBy === 'date-desc' || sortBy === 'date-asc';

  // Helper for grouping
  const groupedTransactions: Record<string, Transaction[]> = {};
  if (isDateGroupable) {
    sorted.forEach(t => {
      groupedTransactions[t.date] = groupedTransactions[t.date] || [];
      groupedTransactions[t.date].push(t);
    });
  }

  // Format date to local Thai
  const formatDateThai = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      weekday: 'short'
    });
  };

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Daily totals
  const getDailyTotals = (list: Transaction[]) => {
    let incomeSum = 0;
    let expenseSum = 0;
    list.forEach(t => {
      if (t.type === 'income') incomeSum += t.amount;
      else expenseSum += t.amount;
    });
    return { incomeSum, expenseSum };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
      {/* Search & Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ค้นหาตามบันทึกย่อ หรือหมวดหมู่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 rounded-2xl text-sm font-medium text-slate-800 dark:text-white border border-transparent focus:border-slate-200 dark:focus:border-slate-800 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              showFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400'
                : 'bg-slate-50 border-transparent text-slate-600 dark:bg-slate-850 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>ฟิลเตอร์</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-slate-100 dark:border-slate-800 pb-5 mb-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  ประเภทรายการ
                </span>
                <div className="flex gap-2 bg-slate-50 dark:bg-slate-850 p-1 rounded-xl">
                  {(['all', 'income', 'expense'] as const).map(t => {
                    const label = t === 'all' ? 'ทั้งหมด' : t === 'income' ? 'รายรับ' : 'รายจ่าย';
                    const isSelected = filter === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? t === 'income'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : t === 'expense'
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-slate-800 text-white dark:bg-slate-700'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sorting Filter */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  เรียงลำดับตาม
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-transparent outline-none focus:border-slate-200 cursor-pointer"
                >
                  <option value="date-desc">วันที่ (ใหม่ไปเก่า)</option>
                  <option value="date-asc">วันที่ (เก่าไปใหม่)</option>
                  <option value="amount-desc">จำนวนเงิน (มากไปน้อย)</option>
                  <option value="amount-asc">จำนวนเงิน (น้อยไปมาก)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Items */}
      {sorted.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
          <Info size={36} strokeWidth={1.5} />
          <p className="text-sm font-semibold">ไม่พบรายการเงินโอนในเงื่อนไขการค้นหา</p>
        </div>
      ) : isDateGroupable ? (
        /* Grouped List by Date */
        <div className="space-y-6">
          {Object.entries(groupedTransactions)
            .sort((a, b) => {
              const timeA = new Date(a[0]).getTime();
              const timeB = new Date(b[0]).getTime();
              return sortBy === 'date-desc' ? timeB - timeA : timeA - timeB;
            })
            .map(([dateKey, list]) => {
              const { incomeSum, expenseSum } = getDailyTotals(list);
              return (
                <div key={dateKey} className="space-y-2">
                  {/* Date Header with totals */}
                  <div className="flex justify-between items-center text-xs font-bold px-1 text-slate-400 tracking-wide pb-1.5 border-b border-slate-50 dark:border-slate-850">
                    <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                      <Calendar size={13} />
                      {formatDateThai(dateKey)}
                    </span>
                    <div className="flex items-center gap-2.5">
                      {incomeSum > 0 && (
                        <span className="text-emerald-500">+{formatCurrency(incomeSum)}</span>
                      )}
                      {expenseSum > 0 && (
                        <span className="text-rose-500">-{formatCurrency(expenseSum)}</span>
                      )}
                    </div>
                  </div>

                  {/* Daily transactions list */}
                  <div className="space-y-2.5">
                    {list.map(t => {
                      const catObj = getCategoryById(t.category, t.type);
                      return (
                        <motion.div
                          key={t.id}
                          layoutId={t.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => onSelectTransaction(t)}
                          className="p-3.5 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-850/40 dark:hover:bg-slate-850/90 rounded-2xl flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catObj.color} ${catObj.textColor}`}>
                              <CategoryIcon name={catObj.icon} size={20} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {t.description || catObj.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">
                                {catObj.name}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-black tracking-tight ${
                              t.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) {
                                  onDeleteTransaction(t.id);
                                }
                              }}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Flat List for Amount Sorting */
        <div className="space-y-2.5">
          {sorted.map(t => {
            const catObj = getCategoryById(t.category, t.type);
            return (
              <motion.div
                key={t.id}
                layoutId={t.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelectTransaction(t)}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-850/40 dark:hover:bg-slate-850/90 rounded-2xl flex items-center justify-between border border-slate-100/50 dark:border-slate-800/50 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catObj.color} ${catObj.textColor}`}>
                    <CategoryIcon name={catObj.icon} size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {t.description || catObj.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">
                      {catObj.name} • {formatDateThai(t.date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black tracking-tight ${
                    t.type === 'income' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) {
                        onDeleteTransaction(t.id);
                      }
                    }}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
