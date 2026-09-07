import React, { useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, LogOut, WalletCards, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthBarProps {
  user: FirebaseUser | null;
  loading: boolean;
}

export const AuthBar: React.FC<AuthBarProps> = ({ user, loading }) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignInGoogle = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Popup sign in failed, trying redirect or logging error:', err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          setAuthError('ไม่สามารถเข้าสู่ระบบได้: ' + (redirectErr.message || 'โปรดลองอีกครั้ง'));
        }
      } else {
        setAuthError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src="/college_logo.jpg"
              alt="ตราสัญลักษณ์ วิทยาลัยอาชีวศึกษาแพร่"
              referrerPolicy="no-referrer"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain bg-white shadow-xs border border-indigo-100 p-0.5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-none">
                MoneyDB
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Firebase
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              วิทยาลัยอาชีวศึกษาแพร่ • ระบบบันทึกรายรับรายจ่าย
            </p>
          </div>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                id="btn-sign-out"
                type="button"
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200/60"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-sign-in-google"
              type="button"
              disabled={signingIn}
              onClick={handleSignInGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{signingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {authError && (
        <div className="bg-rose-50 border-t border-rose-100 text-rose-700 text-xs px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            {authError}
          </span>
          <button 
            type="button" 
            onClick={() => setAuthError(null)} 
            className="text-rose-400 hover:text-rose-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
