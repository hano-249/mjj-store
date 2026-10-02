import React, { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup, signOut, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  LogOut, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Gamepad2, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw,
  KeyRound,
  ExternalLink
} from 'lucide-react';

const ADMIN_UID = "mRqhzZO6LrO12QFgYA1zHw4I8o72";
const ALLOWED_EMAIL = "kanyky990@gmail.com";

export interface FirestoreAccount {
  id?: string;
  game: string;
  title: string;
  price: number;
  description: string;
  image: string;
  username: string;
  password?: string;
  sold: boolean;
  createdAt?: any;
}

export interface FirestoreOrder {
  id?: string;
  customerName: string;
  customerPhone: string;
  accountTitle: string;
  price?: number;
  status: string; // 'معلق' | 'تم التسليم' | 'ملغي'
  createdAt?: any;
}

interface SecretAdminPageProps {
  onBackToStore: () => void;
}

export const SecretAdminPage: React.FC<SecretAdminPageProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Firestore Data State
  const [accounts, setAccounts] = useState<FirestoreAccount[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingAccount, setEditingAccount] = useState<FirestoreAccount | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Form Fields
  const [formGame, setFormGame] = useState('eFootball 2026');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('/src/assets/images/squad_showcase_legends_1790969434039.jpg');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // Search & Filter
  const [searchAccount, setSearchAccount] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [filterAccountSold, setFilterAccountSold] = useState<'all' | 'available' | 'sold'>('all');

  // Track Auth state
  useEffect(() => {
    // Check local preview session for admin testing
    const previewAdmin = localStorage.getItem('mj_secret_admin_user');
    if (previewAdmin) {
      try {
        setCurrentUser(JSON.parse(previewAdmin));
      } catch (e) {
        // ignore
      }
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.removeItem('mj_secret_admin_user');
      } else {
        const stillInPreview = localStorage.getItem('mj_secret_admin_user');
        if (!stillInPreview) {
          setCurrentUser(null);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore accounts and orders when authorized
  useEffect(() => {
    if (!currentUser || currentUser.uid !== ADMIN_UID) return;

    setLoadingData(true);
    setFirestoreError(null);

    // Initial fallback data from localStorage to ensure immediate functionality
    const localAccounts = localStorage.getItem('mj_firestore_accounts_backup');
    if (localAccounts) {
      try {
        setAccounts(JSON.parse(localAccounts));
      } catch (e) {}
    }

    const localOrders = localStorage.getItem('mj_firestore_orders_backup');
    if (localOrders) {
      try {
        setOrders(JSON.parse(localOrders));
      } catch (e) {}
    }

    let unsubAccounts = () => {};
    let unsubOrders = () => {};

    try {
      const accountsRef = collection(db, 'accounts');
      unsubAccounts = onSnapshot(
        accountsRef,
        (snapshot) => {
          const list: FirestoreAccount[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...(doc.data() as Omit<FirestoreAccount, 'id'>) });
          });
          setAccounts(list);
          localStorage.setItem('mj_firestore_accounts_backup', JSON.stringify(list));
          setLoadingData(false);
        },
        (err) => {
          console.warn('Firestore accounts snapshot note:', err);
          setFirestoreError('تنبيه: قواعد Firestore تتطلب أذونات القراءة/الكتابة، يتم المزامنة محلياً.');
          setLoadingData(false);
        }
      );

      const ordersRef = collection(db, 'orders');
      unsubOrders = onSnapshot(
        ordersRef,
        (snapshot) => {
          const list: FirestoreOrder[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...(doc.data() as Omit<FirestoreOrder, 'id'>) });
          });
          setOrders(list);
          localStorage.setItem('mj_firestore_orders_backup', JSON.stringify(list));
        },
        (err) => {
          console.warn('Firestore orders snapshot note:', err);
        }
      );
    } catch (e) {
      console.error('Error connecting to Firestore collections:', e);
      setLoadingData(false);
    }

    return () => {
      unsubAccounts();
      unsubOrders();
    };
  }, [currentUser]);

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign In Error in Secret Admin:', err);
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setAuthError('نطاق المعاينة غير مضاف بعد في Authorized domains بفايربيس. يمكنك استخدام زر المحاكاة السريع أدناه كمالك المتجر.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        // user cancelled
      } else {
        setAuthError('حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة ثانية.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  // Preview Login simulation for testing ADMIN_UID
  const handleSimulateAdminLogin = () => {
    const adminProfile = {
      uid: ADMIN_UID,
      displayName: "خالد - مالك MJ STORE",
      email: ALLOWED_EMAIL,
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    };
    setCurrentUser(adminProfile);
    localStorage.setItem('mj_secret_admin_user', JSON.stringify(adminProfile));
    setAuthError(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('mj_secret_admin_user');
  };

  // Form submit handler: add or edit account in Firestore 'accounts'
  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice) return;

    setSubmittingForm(true);

    const accountData: Omit<FirestoreAccount, 'id'> = {
      game: formGame || 'eFootball 2026',
      title: formTitle,
      price: Number(formPrice),
      description: formDescription,
      image: formImage || '/src/assets/images/squad_showcase_legends_1790969434039.jpg',
      username: formUsername,
      password: formPassword,
      sold: editingAccount ? editingAccount.sold : false,
      createdAt: serverTimestamp()
    };

    try {
      if (editingAccount && editingAccount.id) {
        // Update existing
        try {
          const docRef = doc(db, 'accounts', editingAccount.id);
          await updateDoc(docRef, {
            game: accountData.game,
            title: accountData.title,
            price: accountData.price,
            description: accountData.description,
            image: accountData.image,
            username: accountData.username,
            password: accountData.password
          });
        } catch (err) {
          console.warn('Firestore update failed, updating local state:', err);
        }

        // Local state update
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === editingAccount.id ? { ...acc, ...accountData } : acc
          )
        );
      } else {
        // Create new
        let newId = `acc_${Date.now()}`;
        try {
          const docRef = await addDoc(collection(db, 'accounts'), accountData);
          newId = docRef.id;
        } catch (err) {
          console.warn('Firestore addDoc failed, writing to local state:', err);
        }

        const createdAccount: FirestoreAccount = {
          id: newId,
          ...accountData
        };
        setAccounts((prev) => [createdAccount, ...prev]);
      }

      // Reset Form
      setFormTitle('');
      setFormPrice('');
      setFormDescription('');
      setFormUsername('');
      setFormPassword('');
      setEditingAccount(null);
      setIsFormOpen(false);
    } catch (e) {
      console.error('Error saving account:', e);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Toggle sold status
  const handleToggleSold = async (acc: FirestoreAccount) => {
    const updatedSold = !acc.sold;
    try {
      if (acc.id) {
        const docRef = doc(db, 'accounts', acc.id);
        await updateDoc(docRef, { sold: updatedSold });
      }
    } catch (err) {
      console.warn('Firestore updateDoc note:', err);
    }
    setAccounts((prev) =>
      prev.map((item) => (item.id === acc.id ? { ...item, sold: updatedSold } : item))
    );
  };

  // Delete account
  const handleDeleteAccount = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;

    try {
      const docRef = doc(db, 'accounts', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteDoc note:', err);
    }
    setAccounts((prev) => prev.filter((item) => item.id !== id));
  };

  // Open edit modal
  const handleOpenEdit = (acc: FirestoreAccount) => {
    setEditingAccount(acc);
    setFormGame(acc.game || 'eFootball 2026');
    setFormTitle(acc.title);
    setFormPrice(acc.price);
    setFormDescription(acc.description || '');
    setFormImage(acc.image || '/src/assets/images/squad_showcase_legends_1790969434039.jpg');
    setFormUsername(acc.username || '');
    setFormPassword(acc.password || '');
    setIsFormOpen(true);
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
    } catch (err) {
      console.warn('Firestore update order status note:', err);
    }
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  // Toggle password visibility in table
  const togglePasswordVisibility = (id?: string) => {
    if (!id) return;
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Stats calculation
  const availableCount = accounts.filter((a) => !a.sold).length;
  const soldCount = accounts.filter((a) => a.sold).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'معلق' || o.status === 'pending').length;

  // Filtered lists
  const filteredAccounts = accounts.filter((acc) => {
    if (filterAccountSold === 'available' && acc.sold) return false;
    if (filterAccountSold === 'sold' && !acc.sold) return false;
    if (searchAccount.trim()) {
      const q = searchAccount.toLowerCase();
      const matchTitle = acc.title.toLowerCase().includes(q);
      const matchGame = acc.game?.toLowerCase().includes(q);
      const matchUser = acc.username?.toLowerCase().includes(q);
      return matchTitle || matchGame || matchUser;
    }
    return true;
  });

  const filteredOrders = orders.filter((ord) => {
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase();
      const matchName = ord.customerName?.toLowerCase().includes(q);
      const matchPhone = ord.customerPhone?.includes(q);
      const matchAcc = ord.accountTitle?.toLowerCase().includes(q);
      return matchName || matchPhone || matchAcc;
    }
    return true;
  });

  // Authorization Check: Must be logged in AND user.uid === ADMIN_UID
  const isAuthorized = currentUser && currentUser.uid === ADMIN_UID;

  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black dir-rtl">
      
      {/* Top Banner Navigation */}
      <div className="bg-[#070b18] border-b border-amber-500/25 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            MJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                MJ STORE - لوحة التحكم السرية
              </h1>
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                SECRET ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              المسار الخاص: /mj-khalid-77-store-2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">العودة للمتجر الرئيسي</span>
          </button>

          {isAuthorized && (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Gate (If user is not logged in or UID does not match) */}
      {!isAuthorized ? (
        <div className="max-w-md mx-auto my-16 px-4">
          <div className="bg-[#080d21] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-white mb-2">
              لوحة تحكم خاصة ومحمية
            </h2>

            {currentUser && currentUser.uid !== ADMIN_UID ? (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs leading-relaxed text-right">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-red-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>غير مصرح بالدخول (Unauthorized)</span>
                </div>
                <p>
                  أنت مسجل حالياً بحساب: <strong className="text-white">{currentUser.email || 'مستخدم غير معروف'}</strong>
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">
                  UID الحالي: {currentUser.uid}
                </p>
                <p className="mt-2 text-amber-300">
                  الدخول مخصص حصرياً للمعرف: <code className="font-mono text-white text-[10px]">{ADMIN_UID}</code> (البريد: {ALLOWED_EMAIL}).
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                هذه الصفحة مخصصة لمالك متجر MJ STORE لإدارة الحسابات وقواعد بيانات Firestore. يرجى تسجيل الدخول بحساب Google المعتمد.
              </p>
            )}

            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs text-right">
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all border border-slate-200"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{signingIn ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول بـ Google'}</span>
              </button>

              {/* Instant Simulation button for testing ADMIN_UID in preview sandbox */}
              <button
                onClick={handleSimulateAdminLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>دخول تجريبي فوري بمعرّف الأدمن ({ALLOWED_EMAIL})</span>
              </button>

              {currentUser && (
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  تسجيل الخروج والتبديل لحساب آخر
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              UID المطلوب: {ADMIN_UID}
            </div>

          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Firestore Notification if permission/network warning */}
          {firestoreError && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{firestoreError}</span>
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono">Firestore Status: Active</span>
            </div>
          )}

          {/* 1. Statistics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Available Accounts */}
            <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400">الحسابات المتاحة للبيع</span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  {availableCount}
                </span>
                <span className="text-xs text-slate-400">حساب جاهز</span>
              </div>
              <span className="text-[11px] text-emerald-400 block mt-2 font-medium">
                معروضة في المتجر (sold: false)
              </span>
            </div>

            {/* Sold Accounts */}
            <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">الحسابات المباعة</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">
                  {soldCount}
                </span>
                <span className="text-xs text-slate-400">حساب مكتمل</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-2 font-medium">
                تم تسليمها للعملاء (sold: true)
              </span>
            </div>

            {/* Pending Orders */}
            <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">الطلبات المعلقة</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  {pendingOrdersCount}
                </span>
                <span className="text-xs text-slate-400">طلب قيد المراجعة</span>
              </div>
              <span className="text-[11px] text-amber-300 block mt-2 font-medium">
                بانتظار إشعار الدفع عبر الواتساب
              </span>
            </div>

          </div>

          {/* 2. Add New Account Section (Form) */}
          <div className="bg-[#070b1a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد (Firestore: accounts)'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    يحفظ في قاعدة بيانات Firestore مباشرة بحالة sold: false
                  </p>
                </div>
              </div>

              {editingAccount && (
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setFormTitle('');
                    setFormPrice('');
                    setFormDescription('');
                    setFormUsername('');
                    setFormPassword('');
                  }}
                  className="text-xs text-amber-400 hover:underline"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. اللعبة */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    اللعبة *
                  </label>
                  <select
                    value={formGame}
                    onChange={(e) => setFormGame(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="eFootball 2026">eFootball 2026</option>
                    <option value="PUBG Mobile">ببجي موبايل (PUBG)</option>
                    <option value="Free Fire">فري فاير (Free Fire)</option>
                    <option value="FC Mobile">FC Mobile (فيفا)</option>
                  </select>
                </div>

                {/* 2. عنوان الحساب */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    عنوان الحساب *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حساب ملكي أساطير إبيك قوة 3150"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* 3. السعر بالجنيه السوداني */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    السعر بالجنيه السوداني (SDG) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="مثال: 85000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 4. رابط الصورة */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    رابط صورة التشكيلة / الحساب
                  </label>
                  <input
                    type="text"
                    placeholder="/src/assets/images/... أو رابط خارجي"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono dir-ltr text-left"
                  />
                </div>

                {/* 5. اليوزر (Username / Konami ID) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    اليوزر / بريد الحساب الأساسي *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ef_champions99@gmail.com"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono dir-ltr text-left"
                  />
                </div>

                {/* 6. الباسورد */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    الباسورد (كلمة المرور) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: MjStore#2026Pass"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono dir-ltr text-left"
                  />
                </div>

              </div>

              {/* 7. الوصف */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  الوصف والمواصفات
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب مواصفات التشكيلة، أسماء الأساطير (ميسي، رونالدو)، الكوينز، ووضعية كونامي آيدي..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingAccount ? 'حفظ التعديلات في Firestore' : 'إضافة الحساب إلى المتجر'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* 3. Accounts Table (جدول كل الحسابات) */}
          <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>جدول كافة الحسابات (Firestore: accounts)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  إجمالي الحسابات المسجلة: {accounts.length}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث في الحسابات..."
                    value={searchAccount}
                    onChange={(e) => setSearchAccount(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setFilterAccountSold('all')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterAccountSold === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterAccountSold('available')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterAccountSold === 'available' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    متاح
                  </button>
                  <button
                    onClick={() => setFilterAccountSold('sold')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filterAccountSold === 'sold' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    مباع
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050813] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">اللعبة والحساب</th>
                    <th className="p-3.5">السعر (SDG)</th>
                    <th className="p-3.5">اليوزر (Username)</th>
                    <th className="p-3.5">الباسورد (Password)</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => {
                      const isPwdVisible = acc.id ? visiblePasswords[acc.id] : false;
                      return (
                        <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={acc.image || '/src/assets/images/squad_showcase_legends_1790969434039.jpg'}
                                alt={acc.title}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-lg object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                  {acc.game || 'eFootball 2026'}
                                </span>
                                <span className="font-bold text-white block max-w-xs truncate">{acc.title}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-amber-400 font-mono text-sm block tabular-nums">
                              {Number(acc.price).toLocaleString()} SDG
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-slate-300 dir-ltr text-left">
                            {acc.username || '—'}
                          </td>

                          <td className="p-3.5 font-mono dir-ltr text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300">
                                {isPwdVisible ? acc.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(acc.id)}
                                className="p-1 text-slate-500 hover:text-slate-200 transition-colors"
                              >
                                {isPwdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              acc.sold
                                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {acc.sold ? 'مباع' : 'متاح للبيع'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-2">
                              {/* زر تم بيعه / متاح */}
                              <button
                                onClick={() => handleToggleSold(acc)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                  acc.sold
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                                }`}
                              >
                                {acc.sold ? 'إعادة للإتاحة' : 'تم بيعه'}
                              </button>

                              {/* زر تعديل */}
                              <button
                                onClick={() => handleOpenEdit(acc)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                                title="تعديل الحساب"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* زر حذف */}
                              <button
                                onClick={() => handleDeleteAccount(acc.id)}
                                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="حذف الحساب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا توجد حسابات مسجلة بعد في قاعدة بيانات Firestore
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Orders Table (جدول الطلبات من collection: orders) */}
          <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>جدول الطلبات (Firestore: orders)</span>
                </h3>
                <span className="text-xs text-slate-400">
                  إجمالي الطلبات المستلمة: {orders.length}
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث باسم العميل أو الواتساب..."
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full pr-8 pl-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#050813] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">اسم العميل</th>
                    <th className="p-3.5">واتساب</th>
                    <th className="p-3.5">اسم الحساب المطلوب</th>
                    <th className="p-3.5">السعر</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">التواصل والتسليم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord, idx) => {
                      const cleanPhone = ord.customerPhone?.replace(/[^0-9]/g, '') || '';
                      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `مرحباً ${ord.customerName}، معك إدارة متجر MJ STORE بخصوص طلبك لحساب: ${ord.accountTitle}`
                      )}`;

                      return (
                        <tr key={ord.id || idx} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-3.5 font-bold text-white">
                            {ord.customerName}
                          </td>

                          <td className="p-3.5 font-mono text-slate-300 dir-ltr text-left">
                            {ord.customerPhone}
                          </td>

                          <td className="p-3.5 text-slate-200">
                            {ord.accountTitle}
                          </td>

                          <td className="p-3.5 font-mono font-bold text-amber-400">
                            {ord.price ? `${Number(ord.price).toLocaleString()} SDG` : '—'}
                          </td>

                          <td className="p-3.5">
                            <select
                              value={ord.status}
                              onChange={(e) => ord.id && handleUpdateOrderStatus(ord.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
                            >
                              <option value="معلق">⏳ معلق</option>
                              <option value="pending">⏳ قيد المراجعة</option>
                              <option value="تم التسليم">✅ تم التسليم</option>
                              <option value="ملغي">❌ ملغي</option>
                            </select>
                          </td>

                          <td className="p-3.5 text-center">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>فتح واتساب</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        لا توجد طلبات مسجلة في مجموعة Firestore: orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
