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
  ShoppingBag, 
  MessageCircle, 
  LogOut, 
  ArrowLeft, 
  X, 
  Tag, 
  Star, 
  Image as ImageIcon,
  Check,
  AlertCircle,
  Edit2
} from 'lucide-react';
import { UserProfile } from '../types';
import { compressImageToBase64 } from '../utils/imageCompressor';

export type AccountStatus = 'متاح' | 'محجوز' | 'مباع';

export interface FirestoreAccount {
  id?: string;
  title: string;              // عنوان الحساب
  price: number;              // السعر بالجنيه السوداني
  description: string;        // وصف التشكيلة
  rating: string | number;    // التقييم (مثال: 3150 أو 5/5)
  status: AccountStatus;      // حالة الحساب: متاح / محجوز / مباع
  squadImageBase64?: string;  // Base64 Data URL مباشرة في Firestore
  image?: string;             // رابط الصورة كـ fallback
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
  // Data State
  const [accounts, setAccounts] = useState<FirestoreAccount[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form Fields (Safe manual data: NO username, NO password, NO email)
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formRating, setFormRating] = useState('3150');
  const [formStatus, setFormStatus] = useState<AccountStatus>('متاح');

  // Base64 Image Compression State (100% Free - Zero Storage / Zero Billing)
  const [squadImageBase64, setSquadImageBase64] = useState<string | null>(null);
  const [imageSizeKB, setImageSizeKB] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Edit Modal: تعديل السعر والحالة فقط
  const [editingAccount, setEditingAccount] = useState<FirestoreAccount | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editStatus, setEditStatus] = useState<AccountStatus>('متاح');
  const [savingEdit, setSavingEdit] = useState(false);

  // Search & Filter
  const [searchAccount, setSearchAccount] = useState('');
  const [filterAccountStatus, setFilterAccountStatus] = useState<'all' | AccountStatus>('all');
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
            let statusVal: AccountStatus = 'متاح';
            if (data.status === 'محجوز') statusVal = 'محجوز';
            else if (data.status === 'مباع' || data.sold === true) statusVal = 'مباع';
            else if (data.status === 'متاح') statusVal = 'متاح';

            list.push({
              id: d.id,
              title: data.title || '',
              price: Number(data.price) || 0,
              description: data.description || '',
              rating: data.rating || data.teamStrength || '3150',
              status: statusVal,
              squadImageBase64: data.squadImageBase64 || data.image || '',
              image: data.squadImageBase64 || data.image || '',
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

  // Handle Image Selection with Canvas compression to 800px width & 0.6 quality -> Base64 Data URL
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsCompressing(true);

    try {
      // Compress with Canvas: 800px width & 0.6 JPEG quality -> Base64 Data URL
      const result = await compressImageToBase64(file);
      setSquadImageBase64(result.base64);
      setImageSizeKB(result.sizeKB);
      setIsCompressing(false);
    } catch (err: unknown) {
      setIsCompressing(false);
      setUploadError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة وضغط الصورة');
    }
  };

  // Delete image preview / clear field before saving
  const handleDeleteImage = () => {
    setSquadImageBase64(null);
    setImageSizeKB(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Add Account (Stores Base64 directly into Firestore 'squadImageBase64' - 100% Free)
  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice) return;
    if (!squadImageBase64) {
      setUploadError('يرجى اختيار صورة التشكيلة أولاً قبل حفظ الحساب');
      return;
    }

    setSubmittingForm(true);

    try {
      const accountData = {
        title: formTitle.trim(),
        price: Number(formPrice),
        description: formDescription.trim(),
        rating: formRating.trim() || '3150',
        status: formStatus,
        squadImageBase64: squadImageBase64,
        image: squadImageBase64, // Keep image field in sync
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'accounts'), accountData);

      // Reset form
      setFormTitle('');
      setFormPrice('');
      setFormDescription('');
      setFormRating('3150');
      setFormStatus('متاح');
      handleDeleteImage();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'فشل حفظ الحساب في قاعدة البيانات');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Open Quick Edit Modal (تعديل السعر والحالة فقط)
  const handleOpenQuickEdit = (acc: FirestoreAccount) => {
    setEditingAccount(acc);
    setEditPrice(acc.price);
    setEditStatus(acc.status);
  };

  // Save Quick Edit (السعر والحالة فقط)
  const handleSaveQuickEdit = async () => {
    if (!editingAccount || !editingAccount.id || !editPrice) return;
    setSavingEdit(true);

    try {
      const docRef = doc(db, 'accounts', editingAccount.id);
      await updateDoc(docRef, {
        price: Number(editPrice),
        status: editStatus,
        sold: editStatus === 'مباع'
      });
      setEditingAccount(null);
    } catch {
      // handled
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
    } catch {
      // handled
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { status });
    } catch {
      // handled
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

  // Stats
  const availableCount = accounts.filter((a) => a.status === 'متاح').length;
  const reservedCount = accounts.filter((a) => a.status === 'محجوز').length;
  const soldCount = accounts.filter((a) => a.status === 'مباع').length;

  // Filtered accounts list
  const filteredAccounts = accounts.filter((acc) => {
    if (filterAccountStatus !== 'all' && acc.status !== filterAccountStatus) {
      return false;
    }
    if (searchAccount.trim()) {
      const q = searchAccount.toLowerCase();
      const matchTitle = acc.title.toLowerCase().includes(q);
      const matchDesc = acc.description?.toLowerCase().includes(q);
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
    <div className="min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black">
      
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
              <span>نظام مجاني 100% (تخزين مباشر في Firestore بدون Storage)</span>
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
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Available Accounts */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">الحسابات المتاحة</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tabular-nums">
                {availableCount}
              </span>
              <span className="text-xs text-slate-400">حساب معروض للبيع</span>
            </div>
          </div>

          {/* Reserved Accounts */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-amber-500/30 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400">الحسابات المحجوزة</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono tabular-nums">
                {reservedCount}
              </span>
              <span className="text-xs text-slate-400">حساب محجوز لعميل</span>
            </div>
          </div>

          {/* Sold Accounts */}
          <div className="bg-gradient-to-br from-[#09112a] to-[#060a1a] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">الحسابات المباعة</span>
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-300 font-mono tabular-nums">
                {soldCount}
              </span>
              <span className="text-xs text-slate-400">تم بيعها وتسليمها</span>
            </div>
          </div>

        </div>

        {/* 1. فورم إضافة حساب جديد (آمن ومجاني 100% - تحويل Base64 فوري) */}
        <div className="bg-[#070b1a] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <span>إضافة حساب جديد للعرض بالمتجر</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                (عنوان الحساب - السعر - وصف التشكيلة - التقييم - الحالة) مع ضغط وحفظ صورة التشكيلة كـ Base64
              </p>
            </div>

            <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
              ✨ حل مجاني 100% بدون Storage
            </div>
          </div>

          <form onSubmit={handleSubmitAccount} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. عنوان الحساب */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  عنوان الحساب *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حساب ملكي أساطير إبيك وشو تايم (ميسي، رونالدو)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 2. السعر (SDG) */}
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

              {/* 3. التقييم / قوة الفريق */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  التقييم / قوة الفريق
                </label>
                <input
                  type="text"
                  placeholder="مثال: 3155 أو 5 نجوم"
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 4. وصف التشكيلة */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  وصف التشكيلة وأبرز اللاعبين والبطاقات
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب أبرز أساطير التشكيلة، حزم الإبيك، والكوينز المتوفرة..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 5. حالة الحساب: متاح / محجوز / مباع */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  حالة الحساب *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="متاح">🟢 متاح للبيع</option>
                  <option value="محجوز">🟡 محجوز لعميل</option>
                  <option value="مباع">🔴 مباع</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-2 leading-relaxed">
                  الحسابات المتاحة تظهر للعملاء في المتجر، والمحجوزة تظهر بحالة حجز، والمباعة يتم إخفاؤها تلقائياً.
                </span>
              </div>

            </div>

            {/* 6. رفع وضغط صورة التشكيلة إلى Base64 Data URL (عرض 800px وجودة 0.6) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <label className="text-xs font-bold text-white block mb-2">
                صورة التشكيلة (ضغط Canvas فوري وحفظ Base64 بدون Storage) *
              </label>

              {/* Single File Input */}
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
                      اضغط هنا لرفع صورة التشكيلة من جهازك
                    </span>
                    <span className="text-[11px] text-slate-400">
                      (يتم ضغط الصورة بالـ Canvas إلى عرض 800px وجودة 0.6 وتحويلها إلى Base64 Data URL مباشرة)
                    </span>
                  </button>
                </div>
              ) : (
                /* Preview + Info + Delete button */
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={squadImageBase64}
                      alt="معاينة التشكيلة"
                      className="w-24 h-24 rounded-lg object-cover border border-slate-700 shrink-0"
                    />

                    <div className="flex-1 min-w-0 w-full space-y-1.5 text-right">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">معاينة صورة التشكيلة (Base64 Data URL)</span>
                        {imageSizeKB && (
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            الحجم: {imageSizeKB} KB (مضغوطة وخفيفة ✅)
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم الضغط بنجاح (عرض 800px، جودة 0.6) وجاهزة للحفظ المباشر في Firestore</span>
                      </div>

                      {isCompressing && (
                        <div className="text-[11px] text-amber-300">
                          جارٍ معالجة وضغط الصورة...
                        </div>
                      )}
                    </div>

                    {/* زر حذف الصورة قبل الحفظ */}
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

        {/* 2. جدول الحسابات بالداش بورد (صور وسعر وتعديل السعر والحالة فقط) */}
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
                {(['all', 'متاح', 'محجوز', 'مباع'] as const).map((st) => (
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
                  <th className="p-3.5">عنوان الحساب</th>
                  <th className="p-3.5">السعر (SDG)</th>
                  <th className="p-3.5">التقييم</th>
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
                    const imgSrc = acc.squadImageBase64 || acc.image;
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

                        {/* عنوان الحساب */}
                        <td className="p-3.5">
                          <span className="font-bold text-white block max-w-sm truncate text-sm">
                            {acc.title}
                          </span>
                          {acc.description && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-sm mt-0.5">
                              {acc.description}
                            </span>
                          )}
                        </td>

                        {/* السعر */}
                        <td className="p-3.5">
                          <span className="font-black text-amber-400 font-mono text-base block tabular-nums">
                            {Number(acc.price).toLocaleString()} SDG
                          </span>
                        </td>

                        {/* التقييم */}
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{acc.rating || '3150'}</span>
                          </span>
                        </td>

                        {/* الحالة */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              acc.status === 'متاح'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : acc.status === 'محجوز'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {acc.status === 'متاح' && '🟢 متاح'}
                            {acc.status === 'محجوز' && '🟡 محجوز'}
                            {acc.status === 'مباع' && '🔴 مباع'}
                          </span>
                        </td>

                        {/* زر تعديل السعر والحالة فقط + حذف */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenQuickEdit(acc)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-xs font-bold transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>تعديل السعر والحالة</span>
                            </button>

                            <button
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                      لا توجد حسابات مسجلة في قاعدة البيانات حالياً. أضف أول حساب من النموذج أعلاه.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. جدول الطلبات (التواصل والبيع يدوي عبر واتساب خارج الموقع) */}
        <div className="bg-[#070b1a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>طلبات الشراء المستلمة (التواصل والتسليم يدوي عبر واتساب)</span>
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
                  <th className="p-3.5">رقم واتساب</th>
                  <th className="p-3.5">الحساب المطلوب</th>
                  <th className="p-3.5">السعر</th>
                  <th className="p-3.5">حالة الطلب</th>
                  <th className="p-3.5 text-center">التواصل والتسليم اليدوي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.length > 0 ? (
                  filteredOrders.map((ord, idx) => {
                    const cleanPhone = ord.customerPhone?.replace(/[^0-9]/g, '') || '';
                    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `مرحباً ${ord.customerName}، معك إدارة متجر GUNNERS STORE بخصوص طلبك لحساب: ${ord.accountTitle}`
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
                            <span>محادثة واتساب للتسليم اليدوي</span>
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

      {/* Modal: تعديل السعر والحالة فقط */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0a0f24] border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-right">
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>تعديل السعر والحالة فقط</span>
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-bold mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              {editingAccount.title}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  السعر الجديد بالجنيه السوداني (SDG) *
                </label>
                <input
                  type="number"
                  min="1000"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  حالة الحساب *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AccountStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="متاح">🟢 متاح للبيع</option>
                  <option value="محجوز">🟡 محجوز لعميل</option>
                  <option value="مباع">🔴 مباع</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={savingEdit || !editPrice}
                  onClick={handleSaveQuickEdit}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  {savingEdit ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
