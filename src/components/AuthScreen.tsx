/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Coins, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onEnterGuest: () => void;
}

export default function AuthScreen({ onEnterGuest }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-In Error: ", err);
      if (err.code === 'auth/popup-blocked') {
        setError('เบราว์เซอร์บล็อกหน้าต่างป็อปอัป กรุณาอนุญาตป็อปอัปแล้วลองใหม่อีกครั้ง หรือเข้าใช้งานในโหมดบัญชีทดลอง');
      } else {
        setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google: ' + (err.message || err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 text-center"
      >
        {/* App Logo & Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Coins size={26} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            SmartPlook
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          แอปบันทึกรายรับรายจ่าย
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          จัดการกระเป๋าเงินของคุณอย่างชาญฉลาด วิเคราะห์พฤติกรรมการใช้จ่าย วางแผนงบประมาณรายเดือน และจัดเก็บข้อมูลอย่างปลอดภัยบนระบบคลาวด์
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-3 mb-8 text-left">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">วิเคราะห์สถิติครบครัน</h3>
              <p className="text-xs text-slate-400">สรุปกราฟพายและแนวโน้มรายรับรายจ่ายเข้าใจง่าย</p>
            </div>
          </div>
          
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">วิเคราะห์คำแนะนำอัจฉริยะ</h3>
              <p className="text-xs text-slate-400">ประเมินสถานะทางการเงินพร้อมรับคำแนะนำรายเดือน</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs flex items-start gap-2.5 text-left border border-red-100 dark:border-red-950/30">
            <AlertCircle className="shrink-0 mt-0.5" size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-semibold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </>
            )}
          </button>

          <div className="relative my-2 flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-slate-100 dark:bg-slate-800" />
            <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase tracking-widest font-medium">
              หรือ
            </span>
          </div>

          <button
            onClick={onEnterGuest}
            disabled={loading}
            className="w-full h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            ใช้งานบัญชีทดลอง (ไม่ระบุตัวตน)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
