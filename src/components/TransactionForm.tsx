/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import CategoryIcon from './CategoryIcon';
import { X, Trash2, Calendar, Edit2, DollarSign } from 'lucide-react';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'uid' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingTransaction
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Pre-fill fields if we're editing an existing transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
    } else {
      // Defaults for new transaction
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD local
      setDescription('');
    }
  }, [editingTransaction, isOpen]);

  // Set default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const defaultCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (defaultCategories.length > 0) {
        setCategory(defaultCategories[0].id);
      }
    }
  }, [type, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่า 0');
      return;
    }
    if (!category) {
      alert('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      alert('กรุณาเลือกวันที่');
      return;
    }

    onSubmit({
      id: editingTransaction?.id,
      amount: parsedAmount,
      type,
      category,
      date,
      description
    });
    onClose();
  };

  const categoriesToRender = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40"
          />

          {/* Drawer for Mobile / Center Modal for Desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 inset-x-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full md:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${editingTransaction ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  {editingTransaction ? <Edit2 size={16} /> : <X className="rotate-45" size={18} />}
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh] md:max-h-[75vh]">
              {/* Type Switcher */}
              <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex gap-1 mb-6">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  รายจ่าย
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  รายรับ
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-6 relative">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  จำนวนเงิน (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold text-slate-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl text-2xl font-black text-slate-800 dark:text-white border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  วันที่ทำรายการ
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white border border-transparent focus:border-slate-200 dark:focus:border-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Category Grid Selection */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  หมวดหมู่
                </label>
                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {categoriesToRender.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center border-2 transition-all gap-1.5 cursor-pointer ${
                          isSelected
                            ? type === 'income'
                              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.color} ${cat.textColor}`}>
                          <CategoryIcon name={cat.icon} size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Note */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  บันทึกความจำ / คำอธิบายเพิ่มเติม
                </label>
                <input
                  type="text"
                  placeholder="เช่น ซื้อชาเย็นทาน, ค่ากะเพราไข่ดาว, เงินปันผล..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 rounded-2xl text-sm font-medium text-slate-800 dark:text-white border border-transparent focus:border-slate-200 dark:focus:border-slate-800 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {editingTransaction && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                        onDelete(editingTransaction.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm flex items-center justify-center transition-all cursor-pointer border border-red-100 dark:border-red-950/30"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                <button
                  type="submit"
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer text-white ${
                    type === 'income'
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
                      : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10'
                  }`}
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
