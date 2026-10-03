import React, { useState, useEffect, useRef } from 'react';
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
  Upload, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Package, 
  LogOut, 
  ArrowLeft, 
  X, 
  Tag, 
  Star, 
  Image as ImageIcon, 
  AlertCircle, 
  Edit2, 
  Smartphone, 
  Coins, 
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { compressImageToBase64 } from '../utils/imageCompressor';

export type AccountStatus = 'متاح للبيع' | 'محجوز' | 'تم البيع';

export interface FirestoreAccount {
  id?: string;
  title: string;                    // عنوان الحساب (إجباري *)
  price: number;                    // السعر بالجنيه السوداني (إجباري *)
  squadImageBase64?: string;        // صورة التشكيلة Base64 (إجباري *)
  image?: string;
  rating?: string;                  // قوة الفريق / التقييم (اختياري)
  platform?: string;                // المنصة (اختياري)
  boosterCount?: number | string;   // نجوم البوستر (اختياري)
  division?: string;                // الديفيجن (اختياري)
  coins?: number | string;          // رصيد الكوينز (اختياري)
  gpPoints?: string;                // نقاط GP (اختياري)
  description?: string;             // وصف التشكيلة (اختياري)
  playersDescription?: string;      // أبرز اللاعبين (اختياري)
  coach?: string;                   // المدرب والتوافق (اختياري)
  formation?: string;               // الخطة الحالية (اختياري)
  status: string;                   // حالة الحساب
  sold?: boolean;
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
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'accounts' | 'orders'>('accounts');

  // Data State
  const [accounts, setAccounts] = useState<FirestoreAccount[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form Fields: 3 REQUIRED (*)
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [squadImageBase64, setSquadImageBase64] = useState<string | null>(null);

  // Form Fields: OPTIONAL (All text/number fields start completely empty)
  const [formRating, setFormRating] = useState('');                   // قوة الفريق / التقييم
  const [formPlatform, setFormPlatform] = useState('موبايل');          // المنصة: Dropdown (موبايل / كونسل / موبايل وكونسل)
  const [formBoosterCount, setFormBoosterCount] = useState<number | ''>(''); // نجوم البوستر
  const [formDivision, setFormDivision] = useState('');               // الديفيجن
  const [formCoins, setFormCoins] = useState<number | ''>('');        // رصيد الكوينز
  const [formGpPoints, setFormGpPoints] = useState('');               // نقاط GP
  const [formPlayersDescription, setFormPlayersDescription] = useState(''); // وصف التشكيلة وأبرز اللاعبين (textarea)
  const [formCoach, setFormCoach] = useState('');                     // المدرب والتوافق
  const [formFormation, setFormFormation] = useState('');             // الخطة الحالية
  const [formStatus, setFormStatus] = useState<AccountStatus>('متاح للبيع'); // حالة الحساب

  // Image upload state
  const [imageSizeKB, setImageSizeKB] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Edit Modal: تعديل السعر فقط
  const [editingAccount, setEditingAccount] = useState<FirestoreAccount | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Search & Filter
  const [searchAccount, setSearchAccount] = useState('');
  const [filterAccountStatus, setFilterAccountStatus] = useState<'all' | 'متاح للبيع' | 'محجوز' | 'تم البيع'>('all');
  const [searchOrder, setSearchOrder] = useState('');

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
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              price: Number(data.price) || 0,
              squadImageBase64: data.squadImageBase64 || data.image || '',
              image: data.squadImageBase64 || data.image || '',
              status: data.status || (data.sold ? 'تم البيع' : 'متاح للبيع'),
              sold: Boolean(data.sold || data.status === 'تم البيع' || data.status === 'مباع'),
              rating: data.rating || data.teamStrength || '',
              platform: data.platform || 'موبايل',
              boosterCount: data.boosterCount !== undefined ? data.boosterCount : '',
              division: data.division || '',
              coins: data.coins !== undefined ? data.coins : '',
              gpPoints: data.gpPoints || '',
              description: data.description || '',
              playersDescription: data.playersDescription || data.description || '',
              coach: data.coach || data.manager || '',
              formation: data.formation || '',
              createdAt: data.createdAt
            });
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

  // Handle Image Selection with Canvas compression to Base64
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsCompressing(true);

    try {
      const result = await compressImageToBase64(file);
      setSquadImageBase64(result.base64);
      setImageSizeKB(result.sizeKB);
      setIsCompressing(false);
    } catch (err: unknown) {
      setIsCompressing(false);
      setUploadError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة وضغط الصورة');
    }
  };

  const handleDeleteImage = () => {
    setSquadImageBase64(null);
    setImageSizeKB(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Add Account - Validate ONLY required fields (title, price, image)
  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Validation ONLY on the 3 required fields
    if (!formTitle.trim()) {
      setUploadError('يرجى إدخال عنوان الحساب (حقل إجباري *)');
      return;
    }
    if (formPrice === '' || Number(formPrice) <= 0) {
      setUploadError('يرجى تحديد السعر بالجنيه السوداني SDG (حقل إجباري *)');
      return;
    }
    if (!squadImageBase64) {
      setUploadError('يرجى رفع صورة التشكيلة Base64 (حقل إجباري *)');
      return;
    }

    setSubmittingForm(true);

    try {
      const isSold = formStatus === 'تم البيع';

      // Base payload with required fields
      const accountData: Record<string, any> = {
        title: formTitle.trim(),
        price: Number(formPrice),
        squadImageBase64: squadImageBase64,
        image: squadImageBase64,
        status: formStatus,
        sold: isSold,
        createdAt: serverTimestamp()
      };

      // Optional fields - saved as separate fields only if filled
      if (formRating.trim()) accountData.rating = formRating.trim();
      if (formPlatform) accountData.platform = formPlatform;
      if (formBoosterCount !== '') accountData.boosterCount = Number(formBoosterCount);
      if (formDivision.trim()) accountData.division = formDivision.trim();
      if (formCoins !== '') accountData.coins = Number(formCoins);
      if (formGpPoints.trim()) accountData.gpPoints = formGpPoints.trim();
      if (formPlayersDescription.trim()) {
        accountData.playersDescription = formPlayersDescription.trim();
        accountData.description = formPlayersDescription.trim();
      }
      if (formCoach.trim()) {
        accountData.coach = formCoach.trim();
        accountData.manager = formCoach.trim();
      }
      if (formFormation.trim()) accountData.formation = formFormation.trim();

      await addDoc(collection(db, 'accounts'), accountData);

      // Reset form completely
      setFormTitle('');
      setFormPrice('');
      setSquadImageBase64(null);
      setImageSizeKB(null);
      setFormRating('');
      setFormPlatform('موبايل');
      setFormBoosterCount('');
      setFormDivision('');
      setFormCoins('');
      setFormGpPoints('');
      setFormPlayersDescription('');
      setFormCoach('');
      setFormFormation('');
      setFormStatus('متاح للبيع');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'فشل حفظ الحساب في قاعدة البيانات');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Immediate Status Change from the table Dropdown (Updates Firestore instantly)
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      const isSold = newStatus === 'تم البيع' || newStatus === 'مباع' || newStatus === 'sold';
      await updateDoc(doc(db, 'accounts', id), {
        status: newStatus,
        sold: isSold
      });
    } catch (err) {
      console.error('Error updating account status:', err);
    }
  };

  // Open Quick Edit Price Modal
  const handleOpenQuickEdit = (acc: FirestoreAccount) => {
    setEditingAccount(acc);
    setEditPrice(acc.price);
  };

  // Save Quick Edit Price
  const handleSaveQuickEdit = async () => {
    if (!editingAccount || !editingAccount.id || !editPrice) return;
    setSavingEdit(true);

    try {
      const docRef = doc(db, 'accounts', editingAccount.id);
      await updateDoc(docRef, {
        price: Number(editPrice)
      });
      setEditingAccount(null);
    } catch (err) {
      console.error('Error updating price:', err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) return;

    try {
      const docRef = doc(db, 'accounts', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    onSignOut();
    onBackToStore();
  };

  // Accurate Counters (Supports both Arabic and English status values)
  const available = accounts.filter(a => 
    a.status === "متاح للبيع" || a.status === "available" || a.status === "متاح" 
  ).length;

  const reserved = accounts.filter(a => 
    a.status === "محجوز" || a.status === "reserved" || a.status?.includes("حجز")
  ).length;

  const sold = accounts.filter(a => 
    a.status === "تم البيع" || a.status === "sold" || a.status === "مباع" || a.status?.includes("بيع")
  ).length;

  // Filtered accounts list
  const filteredAccounts = accounts.filter((acc) => {
    if (filterAccountStatus !== 'all') {
      if (filterAccountStatus === 'متاح للبيع' && !(acc.status === 'متاح للبيع' || acc.status === 'متاح' || acc.status === 'available')) return false;
      if (filterAccountStatus === 'محجوز' && !(acc.status === 'محجوز' || acc.status === 'reserved' || acc.status?.includes('حجز'))) return false;
      if (filterAccountStatus === 'تم البيع' && !(acc.status === 'تم البيع' || acc.status === 'مباع' || acc.status === 'sold' || acc.status?.includes('بيع'))) return false;
    }
    if (searchAccount.trim()) {
      const q = searchAccount.toLowerCase();
      const matchTitle = acc.title.toLowerCase().includes(q);
      const matchDesc = (acc.description || '').toLowerCase().includes(q) || (acc.playersDescription || '').toLowerCase().includes(q);
      return matchTitle || matchDesc;
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
    <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black">
      
      {/* Top Banner Navigation */}
      <div className="bg-[#070b18] border-b border-amber-500/25 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
            GS
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
              لوحة تحكم GUNNERS STORE
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>إدارة الحسابات والطلبات والمبيعات ديناميكياً</span>
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
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs (Accounts vs Orders) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#070b1a] rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'accounts'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>الحسابات والمعروضات ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>طلبات الشراء الواردة ({orders.length})</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Available Accounts Counter */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">الحسابات المتاحة</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tabular-nums">
                {available}
              </span>
              <span className="text-xs text-slate-400">حساب متاح للبيع</span>
            </div>
          </div>

          {/* Reserved Accounts Counter */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400">الحسابات المحجوزة</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">
                {reserved}
              </span>
              <span className="text-xs text-slate-400">حساب محجوز لعميل</span>
            </div>
          </div>

          {/* Sold Accounts Counter */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-red-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400">الحسابات المباعة</span>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-300 font-mono tabular-nums">
                {sold}
              </span>
              <span className="text-xs text-slate-400">تم بيعها وتسليمها</span>
            </div>
          </div>

        </div>

        {activeTab === 'accounts' ? (
          <>
            {/* 1. فورم إضافة حساب جديد الاحترافي والكامل */}
            <div className="bg-[#070b1a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-400" />
                    <span>إضافة حساب جديد (الفورم الكامل)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    الحقول الإجبارية: (العنوان، السعر، وصورة التشكيلة). باقي الحقول اختيارية تماماً ويمكنك تركها فارغة.
                  </p>
                </div>

                <div className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
                  ⚡ حفظ مباشر في Firestore
                </div>
              </div>

              <form onSubmit={handleSubmitAccount} className="space-y-6">
                
                {/* الصف الأول: الحقول الأساسية الإجبارية والحالة */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* 1. عنوان الحساب * */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-slate-200 block mb-1.5">
                      عنوان الحساب <span className="text-amber-400">* (إجباري)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: حساب أساطير شو تايم وإبيك مع ميسي ورونالدو"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 2. السعر بالجنيه السوداني SDG * */}
                  <div>
                    <label className="text-xs font-bold text-slate-200 block mb-1.5">
                      السعر بالجنيه السوداني SDG <span className="text-amber-400">* (إجباري)</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 85000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {/* 12. حالة الحساب */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">
                      حالة الحساب (افتراضي متاح للبيع)
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
                    >
                      <option value="متاح للبيع">🟢 متاح للبيع</option>
                      <option value="محجوز">🟡 محجوز</option>
                      <option value="تم البيع">🔴 تم البيع</option>
                    </select>
                  </div>

                </div>

                {/* الصف الثاني: التقييم، المنصة، البوستر، الديفيجن */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* 3. قوة الفريق / التقييم */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      قوة الفريق / التقييم <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 3150"
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 4. المنصة: Dropdown */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      المنصة <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="موبايل">موبايل (Android / iOS)</option>
                      <option value="كونسل">كونسل (PlayStation / Xbox / PC)</option>
                      <option value="موبايل وكونسل">موبايل وكونسل</option>
                    </select>
                  </div>

                  {/* 5. نجوم البوستر */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      نجوم البوستر <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 5"
                      value={formBoosterCount}
                      onChange={(e) => setFormBoosterCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {/* 6. الديفيجن */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      الديفيجن <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: ديفيجن 1"
                      value={formDivision}
                      onChange={(e) => setFormDivision(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                </div>

                {/* الصف الثالث: الكوينز، نقاط GP، المدرب، الخطة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* 7. رصيد الكوينز */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      رصيد الكوينز <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="مثال: 0 أو 3500"
                      value={formCoins}
                      onChange={(e) => setFormCoins(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {/* 8. نقاط GP */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      نقاط GP <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 1M أو 800K"
                      value={formGpPoints}
                      onChange={(e) => setFormGpPoints(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 10. المدرب والتوافق */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      المدرب والتوافق <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: جوارديولا - تشكيلة اساطير"
                      value={formCoach}
                      onChange={(e) => setFormCoach(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* 11. الخطة الحالية */}
                  <div>
                    <label className="text-xs font-medium text-slate-400 block mb-1.5">
                      الخطة الحالية <span className="text-slate-500">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 4-3-3"
                      value={formFormation}
                      onChange={(e) => setFormFormation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                </div>

                {/* 9. وصف التشكيلة وأبرز اللاعبين (Textarea كبير) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      وصف التشكيلة وأبرز اللاعبين <span className="text-slate-500 font-normal">(اختياري - يظهر بالكرت كأبرز اللاعبين)</span>
                    </label>
                    <span className="text-[11px] text-amber-400">
                      ✨ اكتب اللاعبين هنا (مثال: ميسي - رونالدو - مبابي)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="اكتب هنا أبرز اللاعبين والبطاقات (مثلاً: ميسي 107 - رونالدو شوتايم - مبابي - فييرا - خوليت - ريفالدو)..."
                    value={formPlayersDescription}
                    onChange={(e) => setFormPlayersDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                {/* 13. صورة التشكيلة Base64 * (إجباري) */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <label className="text-xs font-bold text-white block mb-2">
                    صورة التشكيلة Base64 <span className="text-amber-400">* (إجباري)</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!squadImageBase64 ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-6 border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-300 hover:text-white transition-all bg-slate-950/40 hover:bg-slate-900/50"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">
                          اضغط هنا لاختيار صورة التشكيلة من جهازك
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (يتم ضغط الصورة تلقائياً وتحويلها إلى Base64 Data URL لتخزينها مباشرة في Firestore)
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <img
                          src={squadImageBase64}
                          alt="معاينة التشكيلة"
                          className="w-24 h-24 rounded-lg object-cover border border-slate-700 shrink-0"
                        />

                        <div className="flex-1 min-w-0 w-full space-y-1.5 text-right">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">معاينة صورة التشكيلة (Base64)</span>
                            {imageSizeKB && (
                              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                الحجم: {imageSizeKB} KB (مضغوطة بنجاح ✅)
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>الصورة جاهزة للحفظ في Firestore</span>
                          </div>

                          {isCompressing && (
                            <div className="text-[11px] text-amber-300">
                              جارٍ معالجة وضغط الصورة...
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/40 text-xs font-bold transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الصورة</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-3 p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {/* زر حفظ الحساب */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submittingForm || isCompressing || !squadImageBase64}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Tag className="w-4 h-4" />
                    <span>
                      {submittingForm
                        ? 'جارٍ الحفظ في Firestore...'
                        : 'إضافة الحساب للمتجر'}
                    </span>
                  </button>
                </div>

              </form>
            </div>

            {/* 2. جدول الحسابات المعروضة مع الأزرار الثلاثة المباشرة */}
            <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>قائمة الحسابات المعروضة في المتجر</span>
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
                    {(['all', 'متاح للبيع', 'محجوز', 'تم البيع'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterAccountStatus(st)}
                        className={`px-2.5 py-1 rounded transition-colors ${
                          filterAccountStatus === st ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {st === 'all' ? 'الكل' : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#050813] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">صورة التشكيلة</th>
                      <th className="p-3.5">عنوان الحساب والتفاصيل</th>
                      <th className="p-3.5">السعر (SDG)</th>
                      <th className="p-3.5">تعديل الحالة المباشر</th>
                      <th className="p-3.5 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {loadingData ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          جارٍ جلب الحسابات من قاعدة البيانات...
                        </td>
                      </tr>
                    ) : filteredAccounts.length > 0 ? (
                      filteredAccounts.map((acc) => {
                        const imgSrc = acc.squadImageBase64 || acc.image;
                        const currentStatus = (acc.status === 'تم البيع' || acc.status === 'مباع' || acc.status === 'sold')
                          ? 'تم البيع'
                          : (acc.status === 'محجوز' || acc.status === 'reserved')
                          ? 'محجوز'
                          : 'متاح للبيع';

                        return (
                          <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                            
                            {/* صورة التشكيلة */}
                            <td className="p-3.5">
                              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={acc.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <ImageIcon className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* عنوان الحساب والتفاصيل */}
                            <td className="p-3.5">
                              <span className="font-bold text-white block max-w-sm truncate text-sm">
                                {acc.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                                {acc.rating && (
                                  <span className="text-amber-400 font-mono font-bold">قوة: {acc.rating}</span>
                                )}
                                {acc.platform && (
                                  <span>· {acc.platform}</span>
                                )}
                                {acc.boosterCount !== '' && acc.boosterCount !== undefined && (
                                  <span>· {acc.boosterCount} بوستر</span>
                                )}
                                {acc.coins !== '' && acc.coins !== undefined && (
                                  <span>· {acc.coins} كوينز</span>
                                )}
                              </div>
                              {acc.playersDescription && (
                                <span className="text-[11px] text-slate-400 block truncate max-w-sm mt-0.5">
                                  {acc.playersDescription}
                                </span>
                              )}
                            </td>

                            {/* السعر */}
                            <td className="p-3.5">
                              <span className="font-black text-amber-400 font-mono text-base block tabular-nums">
                                {Number(acc.price).toLocaleString()} SDG
                              </span>
                            </td>

                            {/* زر تعديل الحالة Dropdown المباشر */}
                            <td className="p-3.5">
                              <select
                                value={currentStatus}
                                onChange={(e) => handleQuickStatusChange(acc.id!, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors focus:outline-none ${
                                  currentStatus === 'متاح للبيع'
                                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                    : currentStatus === 'محجوز'
                                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                                    : 'bg-red-950/80 border-red-500/50 text-red-300'
                                }`}
                              >
                                <option value="متاح للبيع" className="bg-slate-900 text-white">🟢 متاح للبيع</option>
                                <option value="محجوز" className="bg-slate-900 text-white">🟡 محجوز</option>
                                <option value="تم البيع" className="bg-slate-900 text-white">🔴 تم البيع</option>
                              </select>
                            </td>

                            {/* الإجراءات: تعديل السعر وحذف */}
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenQuickEdit(acc)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs font-bold transition-colors"
                                  title="تعديل السعر"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>تعديل السعر</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteAccount(acc.id)}
                                  className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 text-xs font-bold transition-colors"
                                  title="حذف الحساب نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          لا توجد حسابات تطابق البحث أو الفلتر المحدد.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Orders Tab */
          <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>طلبات الشراء المسجلة عبر الموقع</span>
                </h3>
                <span className="text-xs text-slate-400">
                  إجمالي الطلبات: {orders.length}
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في الطلبات..."
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
                    <th className="p-3.5">العميل</th>
                    <th className="p-3.5">رقم الهاتف</th>
                    <th className="p-3.5">الحساب المطلوب</th>
                    <th className="p-3.5">السعر</th>
                    <th className="p-3.5">حالة الطلب</th>
                    <th className="p-3.5 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{ord.customerName}</td>
                        <td className="p-3.5 font-mono text-slate-300" dir="ltr">{ord.customerPhone}</td>
                        <td className="p-3.5 font-semibold text-amber-300">{ord.accountTitle}</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-bold">
                          {ord.price ? `${ord.price.toLocaleString()} SDG` : '-'}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.status || 'pending'}
                            onChange={(e) => handleUpdateOrderStatus(ord.id!, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="pending">⏳ قيد المراجعة</option>
                            <option value="completed">✅ مكتمل وتم التسليم</option>
                            <option value="cancelled">❌ ملغي</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-center">
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `مرحباً ${ord.customerName}، معك إدارة متجر GUNNERS STORE بخصوص طلبك لحساب: ${ord.accountTitle}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        لا توجد طلبات شراء مسجلة حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Quick Edit Price Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1228] border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>تعديل سعر الحساب</span>
              </h4>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 line-clamp-1 font-semibold">
              {editingAccount.title}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  السعر الجديد (SDG)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={savingEdit || !editPrice}
                  onClick={handleSaveQuickEdit}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'جارٍ الحفظ...' : 'تحديث السعر'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
