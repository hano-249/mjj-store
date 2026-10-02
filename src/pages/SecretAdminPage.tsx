import React, { useState, useEffect } from 'react';
import { auth, signOut, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  LogOut, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check
} from 'lucide-react';
import { UserProfile } from '../types';

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
  createdAt?: unknown;
}

export interface FirestoreOrder {
  id?: string;
  customerName: string;
  customerPhone: string;
  accountTitle: string;
  price?: number;
  status: string;
  createdAt?: unknown;
}

interface SecretAdminPageProps {
  user: UserProfile;
  onBackToStore: () => void;
  onSignOut: () => void;
}

export const SecretAdminPage: React.FC<SecretAdminPageProps> = ({ onBackToStore, onSignOut }) => {
  // Firestore Data State
  const [accounts, setAccounts] = useState<FirestoreAccount[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Editing state
  const [editingAccount, setEditingAccount] = useState<FirestoreAccount | null>(null);
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

  // Real-time Firestore sync
  useEffect(() => {
    setLoadingData(true);

    let unsubAccounts = () => {};
    let unsubOrders = () => {};

    try {
      const accountsRef = collection(db, 'accounts');
      unsubAccounts = onSnapshot(
        accountsRef,
        (snapshot) => {
          const list: FirestoreAccount[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as Omit<FirestoreAccount, 'id'>) });
          });
          setAccounts(list);
          setLoadingData(false);
        },
        () => {
          setLoadingData(false);
        }
      );

      const ordersRef = collection(db, 'orders');
      unsubOrders = onSnapshot(
        ordersRef,
        (snapshot) => {
          const list: FirestoreOrder[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as Omit<FirestoreOrder, 'id'>) });
          });
          setOrders(list);
        },
        () => {}
      );
    } catch {
      setLoadingData(false);
    }

    return () => {
      unsubAccounts();
      unsubOrders();
    };
  }, []);

  const handleSignOutClick = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    onSignOut();
    onBackToStore();
  };

  // Form submit: add or edit account in Firestore 'accounts'
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
      } else {
        await addDoc(collection(db, 'accounts'), accountData);
      }

      // Reset Form
      setFormTitle('');
      setFormPrice('');
      setFormDescription('');
      setFormUsername('');
      setFormPassword('');
      setEditingAccount(null);
    } catch {
      // handled
    } finally {
      setSubmittingForm(false);
    }
  };

  // Toggle sold status in Firestore
  const handleToggleSold = async (acc: FirestoreAccount) => {
    if (!acc.id) return;
    try {
      const docRef = doc(db, 'accounts', acc.id);
      await updateDoc(docRef, { sold: !acc.sold });
    } catch {
      // handled
    }
  };

  // Delete account from Firestore
  const handleDeleteAccount = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;

    try {
      const docRef = doc(db, 'accounts', id);
      await deleteDoc(docRef);
    } catch {
      // handled
    }
  };

  // Open edit mode
  const handleOpenEdit = (acc: FirestoreAccount) => {
    setEditingAccount(acc);
    setFormGame(acc.game || 'eFootball 2026');
    setFormTitle(acc.title);
    setFormPrice(acc.price);
    setFormDescription(acc.description || '');
    setFormImage(acc.image || '/src/assets/images/squad_showcase_legends_1790969434039.jpg');
    setFormUsername(acc.username || '');
    setFormPassword(acc.password || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update order status in Firestore
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
    } catch {
      // handled
    }
  };

  const togglePasswordVisibility = (id?: string) => {
    if (!id) return;
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Stats
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

  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black">
      
      {/* Top Banner Navigation */}
      <div className="bg-[#070b18] border-b border-amber-500/25 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            MJ
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
              لوحة إدارة المتجر
            </h1>
            <p className="text-[11px] text-slate-400">
              إدارة الحسابات والطلبات الرسمية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span className="hidden sm:inline">العودة للمتجر</span>
          </button>

          <button
            onClick={handleSignOutClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/30 border border-red-500/40 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Available Accounts */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400">الحسابات المتاحة</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tabular-nums">
                {availableCount}
              </span>
              <span className="text-xs text-slate-400">حساب معروض</span>
            </div>
          </div>

          {/* Sold Accounts */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-slate-800 rounded-2xl p-5 shadow-xl">
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
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-slate-800 rounded-2xl p-5 shadow-xl">
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
          </div>

        </div>

        {/* 2. Add / Edit Account Form */}
        <div className="bg-[#070b1a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  {editingAccount ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}
                </h2>
                <p className="text-xs text-slate-400">
                  الحفظ المباشر في قاعدة بيانات المتجر
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
                  placeholder="/src/assets/images/... أو رابط"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono dir-ltr text-left"
                />
              </div>

              {/* 5. اليوزر */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  اليوزر / بريد الحساب الأساسي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="بريد تسجيل الدخول"
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
                  placeholder="كلمة المرور"
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
                placeholder="تفاصيل التشكيلة، الأساطير، الكوينز، والضمان..."
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
                <span>{editingAccount ? 'حفظ التعديلات' : 'إضافة الحساب للمتجر'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* 3. Accounts Table */}
        <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>جدول كافة الحسابات</span>
              </h3>
              <span className="text-xs text-slate-400">
                إجمالي الحسابات: {accounts.length}
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
                  <th className="p-3.5">اليوزر</th>
                  <th className="p-3.5">الباسورد</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loadingData ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      جارٍ جلب الحسابات من قاعدة البيانات...
                    </td>
                  </tr>
                ) : filteredAccounts.length > 0 ? (
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

                            <button
                              onClick={() => handleOpenEdit(acc)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="حذف"
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
                      لا توجد حسابات مسجلة في قاعدة البيانات حالياً. يمكنك إضافة أول حساب أعلاه.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Orders Table */}
        <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>جدول الطلبات المستلمة</span>
              </h3>
              <span className="text-xs text-slate-400">
                إجمالي الطلبات: {orders.length}
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
                  <th className="p-3.5">الحساب المطلوب</th>
                  <th className="p-3.5">السعر</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">التواصل والتسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.length > 0 ? (
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
                      لا توجد طلبات جديدة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
