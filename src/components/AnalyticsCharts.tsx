/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Transaction, TransactionType } from '../types';
import { getCategoryById } from '../utils/categories';
import CategoryIcon from './CategoryIcon';
import { PieChart, BarChart2, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

interface CategorySum {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  textColor: string;
  icon: string;
}

export default function AnalyticsCharts({ transactions, selectedMonth }: AnalyticsChartsProps) {
  const [chartType, setChartType] = useState<TransactionType>('expense');

  // Filter transactions by selected month and type
  const filteredList = transactions.filter(
    t => t.date.substring(0, 7) === selectedMonth && t.type === chartType
  );

  const totalAmount = filteredList.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryGroups: Record<string, number> = {};
  filteredList.forEach(t => {
    categoryGroups[t.category] = (categoryGroups[t.category] || 0) + t.amount;
  });

  // Map to CategorySum object list and sort descending
  const data: CategorySum[] = Object.entries(categoryGroups)
    .map(([catId, amount]) => {
      const catObj = getCategoryById(catId, chartType);
      return {
        id: catId,
        name: catObj.name,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
        color: catObj.color,
        textColor: catObj.textColor,
        icon: catObj.icon
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Helper for currency formatting
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // SVG Doughnut Chart calculations
  let accumulatedPercent = 0;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Category breakdown (Doughnut Ring Chart) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <PieChart className="text-indigo-500" size={18} />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              สัดส่วน{chartType === 'expense' ? 'รายจ่าย' : 'รายรับ'}ตามหมวดหมู่
            </h3>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 text-xs">
            <button
              onClick={() => setChartType('expense')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setChartType('income')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                chartType === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              รายรับ
            </button>
          </div>
        </div>

        {totalAmount === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <Info size={32} strokeWidth={1.5} />
            <p className="text-sm font-semibold">ไม่มีข้อมูลการทำธุรกรรมในเดือนนี้</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Doughnut SVG */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(241, 245, 249, 0.5)"
                  strokeWidth="12"
                />
                {/* Segments */}
                {data.map((item, idx) => {
                  const dashArray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const dashOffset = `${circumference - (accumulatedPercent / 100) * circumference}`;
                  accumulatedPercent += item.percentage;

                  // Define unique tailwind stroke color
                  let strokeColor = '#94a3b8'; // gray-400
                  if (item.id === 'food') strokeColor = '#f97316';
                  else if (item.id === 'shopping') strokeColor = '#ec4899';
                  else if (item.id === 'transport') strokeColor = '#3b82f6';
                  else if (item.id === 'home') strokeColor = '#a855f7';
                  else if (item.id === 'utilities') strokeColor = '#f59e0b';
                  else if (item.id === 'entertainment') strokeColor = '#6366f1';
                  else if (item.id === 'medical') strokeColor = '#ef4444';
                  else if (item.id === 'education') strokeColor = '#10b981';
                  else if (item.id === 'salary') strokeColor = '#10b981';
                  else if (item.id === 'business') strokeColor = '#14b8a6';
                  else if (item.id === 'investment') strokeColor = '#06b6d4';
                  else if (item.id === 'side_income') strokeColor = '#f59e0b';
                  else if (item.id === 'gift') strokeColor = '#8b5cf6';
                  else if (item.id === 'other_income') strokeColor = '#22c55e';

                  return (
                    <motion.circle
                      key={item.id}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={strokeColor}
                      strokeWidth="12"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  ยอดรวม{chartType === 'expense' ? 'จ่าย' : 'รับ'}
                </span>
                <span className="text-lg font-black text-slate-800 dark:text-white mt-0.5 truncate max-w-[130px]">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* List Legends */}
            <div className="flex-1 w-full max-h-56 overflow-y-auto space-y-3 pr-1">
              {data.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${item.color} ${item.textColor}`}>
                      <CategoryIcon name={item.icon} size={13} />
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 line-clamp-1">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-800 dark:text-white font-bold block">{formatCurrency(item.amount)}</span>
                    <span className="text-[10px] text-slate-400">{item.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Distribution Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="text-indigo-500" size={18} />
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            ลำดับความถี่ในการจ่ายและรับยอดเงิน
          </h3>
        </div>

        {totalAmount === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <Info size={32} strokeWidth={1.5} />
            <p className="text-sm font-semibold">ไม่มีข้อมูลวิเคราะห์ในเดือนนี้</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
            {data.map((item, idx) => (
              <div key={item.id}>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono w-4">#{idx + 1}</span>
                    <span>{item.name}</span>
                  </div>
                  <span>{formatCurrency(item.amount)} ({item.percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.7, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      chartType === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
