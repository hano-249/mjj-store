import React from 'react';
import { UserProfile } from '../types';
import { auth, signOut } from '../firebase';
import { ShieldCheck, LogOut, Trophy, Heart, Shield } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  loadingAuth: boolean;
  wishlistCount: number;
  isAdmin?: boolean;
  onOpenWishlist: () => void;
  onOpenAdmin?: () => void;
  onInitiateSignIn: () => void;
  onSignOut: () => void;
  authError?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  wishlistCount,
  isAdmin = false,
  onOpenWishlist,
  onOpenAdmin,
  onInitiateSignIn,
  onSignOut,
  authError
}) => {
  const handleSignOutClick = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch {
      onSignOut();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b19]/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Zone 1 (Right in RTL): Brand Wordmark */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-blue-900 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-[#070c1d] rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                MJ
              </span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                MJ STORE
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                <Trophy className="w-3 h-3 text-amber-400" />
                eFootball 2026
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden xs:inline">
              المتجر المعتمد لأقوى الحسابات التنافسية
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Clean text links) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#accounts" className="hover:text-amber-400 transition-colors">
            الحسابات المتوفرة
          </a>
          <a href="#why-trust" className="hover:text-amber-400 transition-colors">
            ضمان المتجر
          </a>
          <a href="#payment-methods" className="hover:text-amber-400 transition-colors">
            طرق الدفع (بنكك، أوكاش، ماي كاشي، برافو)
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">
            الأسئلة الشائعة
          </a>
        </nav>

        {/* Zone 3 (Left in RTL): Wishlist, Admin & Google Sign-in */}
        <div className="flex items-center gap-2.5">
          
          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            title="قائمة الرغبات"
            className="relative p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/70 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all flex items-center gap-1.5"
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden md:inline text-xs font-semibold">المفضلة</span>
            {wishlistCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center font-mono">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Admin Panel Button - ONLY visible if verified admin user */}
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="لوحة الإدارة"
              className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
            </button>
          )}

          {/* Google Sign-in or User Profile */}
          {loadingAuth ? (
            <div className="h-10 w-28 bg-slate-800/60 rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl shadow-inner">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'المستخدم'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-amber-400/50 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                  {user.displayName || 'عميل المتجر'}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> حساب موثق
                </span>
              </div>

              <button
                onClick={handleSignOutClick}
                title="تسجيل الخروج"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mr-1"
                aria-label="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onInitiateSignIn}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 active:scale-95 rounded-xl transition-all duration-150 shadow-md shadow-white/10 border border-slate-200 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="whitespace-nowrap font-bold text-slate-900 hidden xs:inline">
                متابعة باستخدام Google
              </span>
              <span className="whitespace-nowrap font-bold text-slate-900 xs:hidden">
                دخول
              </span>
            </button>
          )}
        </div>

      </div>

      {authError && (
        <div className="bg-red-950/60 border-t border-red-500/30 py-2 px-4 text-center text-xs text-red-300">
          {authError}
        </div>
      )}
    </header>
  );
};
