/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Transaction, Budget, DashboardStats } from './types';
import AuthScreen from './components/AuthScreen';
import MonthlySummary from './components/MonthlySummary';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import CategoryIcon from './components/CategoryIcon';
import {
  LogOut,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Coins,
  Sparkles,
  Info,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';

// Pre-filled demo data for beautiful guest experience
const getInitialDemoTransactions = (uid: string, monthStr: string): Transaction[] => {
  const [year, month] = monthStr.split('-');
  return [
    {
      id: 'demo_t1',
      uid,
      amount: 42000,
      type: 'income',
      category: 'salary',
      date: `${year}-${month}-01`,
      description: 'เงินเดือนประจำ',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t2',
      uid,
      amount: 4500,
      type: 'income',
      category: 'side_income',
      date: `${year}-${month}-03`,
      description: 'งานพาร์ทไทม์รับเขียนเว็บ',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t3',
      uid,
      amount: 1500,
      type: 'expense',
      category: 'utilities',
      date: `${year}-${month}-02`,
      description: 'ค่าไฟและอินเทอร์เน็ตประจำเดือน',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t4',
      uid,
      amount: 320,
      type: 'expense',
      category: 'food',
      date: `${year}-${month}-02`,
      description: 'ส้มตำแซ่บๆ มื้อกลางวัน',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t5',
      uid,
      amount: 1200,
      type: 'expense',
      category: 'shopping',
      date: `${year}-${month}-03`,
      description: 'เสื้อผ้าและรองเท้าวิ่งคู่ใหม่',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t6',
      uid,
      amount: 850,
      type: 'expense',
      category: 'entertainment',
      date: `${year}-${month}-04`,
      description: 'ตั๋วหนังและขนมหวานสุดสัปดาห์',
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_t7',
      uid,
      amount: 140,
      type: 'expense',
      category: 'food',
      date: `${year}-${month}-04`,
      description: 'กาแฟเย็นชื่นใจแก้วใหญ่',
      createdAt: new Date().toISOString()
    }
  ];
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Core state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM
  const [darkMode, setDarkMode] = useState(false);

  // Form controlling state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Set default current month (local timezone) on start
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);

    // Detect browser dark mode preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Sync dark mode class with body element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuestMode(false);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Data sync based on User or Guest mode
  useEffect(() => {
    if (authLoading || !selectedMonth) return;

    if (user) {
      // 1. Firebase Firestore sync for authenticated user
      const qTransactions = query(
        collection(db, 'transactions'),
        where('uid', '==', user.uid)
      );
      
      const unsubscribeTrans = onSnapshot(qTransactions, (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
        });
        setTransactions(list);
      });

      const qBudgets = query(
        collection(db, 'budgets'),
        where('uid', '==', user.uid)
      );

      const unsubscribeBudgets = onSnapshot(qBudgets, (snapshot) => {
        const list: Budget[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Budget);
        });
        setBudgets(list);
      });

      return () => {
        unsubscribeTrans();
        unsubscribeBudgets();
      };
    } else if (isGuestMode) {
      // 2. LocalStorage sync for guest/demo user
      const guestUid = 'guest_user';
      
      // Load transactions
      const localTransRaw = localStorage.getItem('guest_transactions');
      if (localTransRaw) {
        setTransactions(JSON.parse(localTransRaw));
      } else {
        // Pre-fill initial gorgeous demo transactions
        const initialDemo = getInitialDemoTransactions(guestUid, selectedMonth);
        localStorage.setItem('guest_transactions', JSON.stringify(initialDemo));
        setTransactions(initialDemo);
      }

      // Load budgets
      const localBudgetsRaw = localStorage.getItem('guest_budgets');
      if (localBudgetsRaw) {
        setBudgets(JSON.parse(localBudgetsRaw));
      } else {
        // Default initial budget limit = 15,000 Baht
        const initialBudget: Budget = {
          id: `${guestUid}_${selectedMonth}`,
          uid: guestUid,
          month: selectedMonth,
          limit: 15000
        };
        const budgetsList = [initialBudget];
        localStorage.setItem('guest_budgets', JSON.stringify(budgetsList));
        setBudgets(budgetsList);
      }
    } else {
      // If signed out and not guest, clear lists
      setTransactions([]);
      setBudgets([]);
    }
  }, [user, isGuestMode, authLoading, selectedMonth]);

  // Handle month shifting
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${prevYear}-${prevMonth}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextYear}-${nextMonth}`);
  };

  // Get current active month string (Thai locale)
  const getSelectedMonthLabel = () => {
    if (!selectedMonth) return '';
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
  };

  // Transaction Actions
  const handleAddOrEditTransaction = async (data: Omit<Transaction, 'id' | 'uid' | 'createdAt'> & { id?: string }) => {
    const uid = user ? user.uid : 'guest_user';
    const id = data.id || `t_${Date.now()}`;
    const createdAt = new Date().toISOString();

    const payload: Transaction = {
      id,
      uid,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      description: data.description,
      createdAt
    };

    if (user) {
      // Write to Firestore
      try {
        await setDoc(doc(db, 'transactions', id), payload);
      } catch (err) {
        console.error('Error adding/updating in Firestore:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยังระบบคลาวด์');
      }
    } else {
      // Write to LocalStorage
      const updatedList = data.id
        ? transactions.map(t => (t.id === data.id ? { ...t, ...payload } : t))
        : [payload, ...transactions];
      setTransactions(updatedList);
      localStorage.setItem('guest_transactions', JSON.stringify(updatedList));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      // Delete from Firestore
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (err) {
        console.error('Error deleting from Firestore:', err);
        alert('เกิดข้อผิดพลาดในการลบข้อมูลบนระบบคลาวด์');
      }
    } else {
      // Delete from LocalStorage
      const updatedList = transactions.filter(t => t.id !== id);
      setTransactions(updatedList);
      localStorage.setItem('guest_transactions', JSON.stringify(updatedList));
    }
  };

  // Budget Limit Actions
  const handleUpdateBudgetLimit = async (limit: number) => {
    const uid = user ? user.uid : 'guest_user';
    const budgetId = `${uid}_${selectedMonth}`;
    const payload: Budget = {
      id: budgetId,
      uid,
      month: selectedMonth,
      limit
    };

    if (user) {
      try {
        await setDoc(doc(db, 'budgets', budgetId), payload);
      } catch (err) {
        console.error('Error setting budget in Firestore:', err);
        alert('เกิดข้อผิดพลาดในการบันทึกงบประมาณไปยังคลาวด์');
      }
    } else {
      const updatedBudgets = budgets.some(b => b.month === selectedMonth)
        ? budgets.map(b => (b.month === selectedMonth ? { ...b, limit } : b))
        : [...budgets, payload];
      setBudgets(updatedBudgets);
      localStorage.setItem('guest_budgets', JSON.stringify(updatedBudgets));
    }
  };

  // Compute stats for current month
  const getStats = (): DashboardStats => {
    const currentTrans = transactions.filter(t => t.date.substring(0, 7) === selectedMonth);
    let totalIncome = 0;
    let totalExpense = 0;

    currentTrans.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const activeBudget = budgets.find(b => b.month === selectedMonth);
    const limit = activeBudget ? activeBudget.limit : 0;
    const remainingBudget = limit - totalExpense;
    const budgetProgress = limit > 0 ? (totalExpense / limit) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      budgetProgress,
      remainingBudget
    };
  };

  // Log Out / Reset Guest Mode
  const handleLogout = async () => {
    if (user) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Sign Out error:', err);
      }
    } else {
      setIsGuestMode(false);
    }
  };

  // Displaying active budget limit
  const activeBudgetObj = budgets.find(b => b.month === selectedMonth);
  const activeBudgetLimit = activeBudgetObj ? activeBudgetObj.limit : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-semibold">กำลังโหลดข้อมูลระบบบัญชี...</p>
      </div>
    );
  }

  // Not logged in AND not in guest mode → show Auth Screen
  if (!user && !isGuestMode) {
    return <AuthScreen onEnterGuest={() => setIsGuestMode(true)} />;
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors pb-12">
      {/* Upper Brand / Profile Bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 shadow-sm px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Coins size={20} />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              SmartPlook
            </span>
            {isGuestMode && (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full uppercase tracking-wider">
                บัญชีทดลอง
              </span>
            )}
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile Frame */}
            <div className="flex items-center gap-2 border-l border-slate-100 dark:border-slate-800 pl-3">
              {user ? (
                <>
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[120px]">
                      {user.displayName || user.email || 'ผู้ใช้งาน'}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block">Google Login</span>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </>
              ) : (
                <div className="hidden sm:flex flex-col text-right">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    ผู้ใช้งานทดลอง
                  </p>
                  <span className="text-[9px] text-slate-400 font-bold block">Offline Mode</span>
                </div>
              )}

              {/* Log Out Icon */}
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="ออกจากระบบ"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Core View Area */}
      <main className="max-w-6xl mx-auto px-4 pt-6 md:px-8">
        {/* Dynamic Month Selector Bar */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm mb-6">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              รายงานประจำเดือน
            </h2>
            <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">
              {getSelectedMonthLabel()}
            </p>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Totals & Health Score Summary Cards */}
        <MonthlySummary
          stats={stats}
          budgetLimit={activeBudgetLimit}
          onUpdateBudget={handleUpdateBudgetLimit}
          selectedMonthLabel={getSelectedMonthLabel()}
        />

        {/* SVG Interactive Analytics Charts */}
        <AnalyticsCharts
          transactions={transactions}
          selectedMonth={selectedMonth}
        />

        {/* Dynamic Transaction List Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                รายการธุรกรรมทั้งหมดประจำเดือน
              </h3>
            </div>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>เพิ่มรายการ</span>
            </button>
          </div>

          <TransactionList
            transactions={transactions}
            onSelectTransaction={(t) => {
              setEditingTransaction(t);
              setIsFormOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            selectedMonth={selectedMonth}
          />
        </div>
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingTransaction(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 z-30 cursor-pointer border-2 border-white/25"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Sliding Drawer/Modal Form for New/Edit Transaction */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddOrEditTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
