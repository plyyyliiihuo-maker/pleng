/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardStats } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, Check, Edit2 } from 'lucide-react';

interface MonthlySummaryProps {
  stats: DashboardStats;
  budgetLimit: number;
  onUpdateBudget: (limit: number) => void;
  selectedMonthLabel: string;
}

export default function MonthlySummary({
  stats,
  budgetLimit,
  onUpdateBudget,
  selectedMonthLabel
}: MonthlySummaryProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budgetLimit.toString());

  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
      setIsEditingBudget(false);
    } else {
      alert('กรุณากรอกงบประมาณที่ถูกต้อง');
    }
  };

  const percentSpent = stats.budgetProgress;
  const isOverBudget = percentSpent > 100;

  // Formatting Thai currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Balance & Totals Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[180px]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">
              ยอดคงเหลือสุทธิ • {selectedMonthLabel}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Wallet size={18} />
          </div>
        </div>

        <div className="my-3 z-10">
          <span className="text-sm font-medium text-slate-400">เงินคงเหลือรวม</span>
          <h2 className="text-3xl font-black tracking-tight mt-1 truncate">
            {formatCurrency(stats.balance)}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2 z-10 text-xs">
          <div>
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <ArrowUpRight size={14} className="text-emerald-400" /> รายรับรวม
            </span>
            <span className="font-bold text-emerald-400 text-sm">{formatCurrency(stats.totalIncome)}</span>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1 mb-1">
              <ArrowDownRight size={14} className="text-rose-400" /> รายจ่ายรวม
            </span>
            <span className="font-bold text-rose-400 text-sm">{formatCurrency(stats.totalExpense)}</span>
          </div>
        </div>
      </motion.div>

      {/* Budget Progress Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[180px]"
      >
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                แผนควบคุมค่าใช้จ่าย
              </span>
              <div className="flex items-center gap-2 mt-1">
                {isEditingBudget ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="w-24 px-2 py-1 text-sm font-bold border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-850 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveBudget}
                      className="p-1 rounded bg-emerald-500 text-white cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
                      {budgetLimit > 0 ? formatCurrency(budgetLimit) : 'ยังไม่ได้ตั้งงบ'}
                    </h3>
                    <button
                      onClick={() => {
                        setTempBudget(budgetLimit.toString());
                        setIsEditingBudget(true);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOverBudget ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'}`}>
              <Target size={18} />
            </div>
          </div>

          {budgetLimit > 0 ? (
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-semibold">
                <span>ใช้ไปแล้ว {percentSpent.toFixed(0)}%</span>
                <span className={isOverBudget ? 'text-rose-500 font-bold' : 'text-slate-500'}>
                  {formatCurrency(stats.totalExpense)} / {formatCurrency(budgetLimit)}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentSpent, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isOverBudget ? 'bg-rose-500' : percentSpent > 80 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              ตั้งค่าเป้าหมายงบประมาณเพื่อควบคุมรายจ่ายในแต่ละเดือนไม่ให้บานปลาย
            </p>
          )}
        </div>

        {budgetLimit > 0 && (
          <div className="text-xs pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">งบประมาณที่เหลือ:</span>
            <span className={`font-bold ${stats.remainingBudget < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {formatCurrency(stats.remainingBudget)}
            </span>
          </div>
        )}
      </motion.div>

      {/* Financial Health Assistant / Insights Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col justify-between min-h-[180px]"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              การประเมินสถานะทางการเงิน
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <Sparkles className="text-amber-500 animate-pulse" size={15} /> สรุปข้อมูลสุขภาพกระเป๋าเงิน
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 my-1">
          {stats.totalIncome === 0 && stats.totalExpense === 0 ? (
            <p>ยังไม่มีข้อมูลธุรกรรมในเดือนนี้ เริ่มบันทึกรายรับรายจ่ายของคุณเพื่อวิเคราะห์สถิติ!</p>
          ) : stats.totalExpense > stats.totalIncome ? (
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              ⚠️ เดือนนี้มีรายจ่ายสูงกว่ารายรับ คุณใช้เงินเกินตัวไป {(stats.totalExpense - stats.totalIncome).toFixed(0)} บาท ควรเริ่มประหยัดในหมวดสินค้าฟุ่มเฟือย
            </p>
          ) : percentSpent > 80 ? (
            <p className="text-amber-600 dark:text-amber-400 font-medium">
              ⚡ ระวัง! คุณใช้เงินงบประมาณไปกว่า {percentSpent.toFixed(0)}% แล้ว เหลือเงินใช้งบเพียง {stats.remainingBudget.toFixed(0)} บาทในเดือนนี้
            </p>
          ) : stats.balance > 0 ? (
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              🎉 เยี่ยมมาก! เดือนนี้มีสภาพคล่องดี มีเงินออม {((stats.balance / stats.totalIncome) * 100).toFixed(0)}% ของรายรับ แนะนำให้นำเงินออมไปลงทุนต่อยอด
            </p>
          ) : (
            <p>สถานะอยู่ในเกณฑ์เฝ้าระวัง ลองพิจารณากำหนดขีดจำกัดงบประมาณเพื่อควบคุมยอดเงินออมเพิ่มขึ้น</p>
          )}
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
          <span>คำแนะนำสร้างสรรค์แบบเรียลไทม์</span>
          <span>Smart Assistant</span>
        </div>
      </motion.div>
    </div>
  );
}
