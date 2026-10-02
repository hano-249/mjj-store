import React, { useState } from 'react';
import { EFootballAccount, CustomerOrder, OrderStatus, UserProfile } from '../types';
import { 
  ShieldCheck, Lock, Plus, Edit3, Trash2, CheckCircle2, Clock, XCircle, 
  Search, DollarSign, Package, ShoppingBag, Eye, ArrowRight, MessageCircle, 
  Sparkles, RefreshCw, Key, LogOut, Check, ChevronDown, Filter, AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: EFootballAccount[];
  orders: CustomerOrder[];
  currentUser: UserProfile | null;
  onAddAccount: (account: EFootballAccount) => void;
  onUpdateAccount: (account: EFootballAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  accounts,
  orders,
  currentUser,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUpdateOrderStatus
}) => {
  // Auth gate state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    currentUser?.email === 'kanyky995@gmail.com' || false
  );
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Tab management
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'orders' | 'transactions'>('overview');

  // Account editing modal state
  const [isEditingAccount, setIsEditingAccount] = useState<EFootballAccount | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Orders filter & search
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Form state for Add/Edit
  const initialFormState: Partial<EFootballAccount> = {
    title: '',
    subtitle: '',
    priceSDG: 45000,
    teamStrength: 3120,
    boosterCount: 8,
    messiCount: 1,
    ronaldoCount: 1,
    coins: 2000,
    gpPoints: '2.5M',
    platform: 'mobile',
    platformLabel: 'موبايل (Android / iOS)',
    image: '/src/assets/images/squad_showcase_legends_1790969434039.jpg',
    featuredBadge: '',
    division: 'ديفيجن 1 (Division 1)',
    manager: 'غوارديولا (88)',
    formation: '4-2-1-3',
    topPlayers: ['ميسي بوستر', 'رونالدو شو تايم'],
    description: '',
    konamiStatus: 'إيميل أساسي متاح للتغيير الكامل',
    guaranteeDays: 30
  };

  const [formData, setFormData] = useState<Partial<EFootballAccount>>(initialFormState);
  const [topPlayersString, setTopPlayersString] = useState('');

  if (!isOpen) return null;

  // Verify Admin credentials
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin secret or admin email check
    if (passcode === 'MJ2026' || passcode === 'admin123' || currentUser?.email === 'kanyky995@gmail.com') {
      setIsAdminUnlocked(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  // Open Edit Form
  const handleOpenEdit = (acc: EFootballAccount) => {
    setIsEditingAccount(acc);
    setFormData(acc);
    setTopPlayersString(acc.topPlayers.join(', '));
    setIsAddingNew(false);
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditingAccount(null);
    setFormData(initialFormState);
    setTopPlayersString('ميسي بوستر, رونالدو شو تايم, فييرا إبيك');
    setIsAddingNew(true);
  };

  // Save Account handler
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const playersList = topPlayersString
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const completeAccount: EFootballAccount = {
      id: isEditingAccount?.id || `mj-ef-${Date.now().toString().slice(-4)}`,
      title: formData.title || 'حساب أساطير eFootball',
      subtitle: formData.subtitle || 'تشكيلة خارقة بأقوى بطاقات البوستر',
      priceSDG: Number(formData.priceSDG) || 30000,
      teamStrength: Number(formData.teamStrength) || 3120,
      boosterCount: Number(formData.boosterCount) || 5,
      messiCount: Number(formData.messiCount) || 0,
      ronaldoCount: Number(formData.ronaldoCount) || 0,
      coins: Number(formData.coins) || 1000,
      gpPoints: formData.gpPoints || '1.5M',
      platform: formData.platform || 'mobile',
      platformLabel: formData.platform === 'console' ? 'كونسول / PC' : 'موبايل (Android / iOS)',
      image: formData.image || '/src/assets/images/squad_showcase_legends_1790969434039.jpg',
      featuredBadge: formData.featuredBadge || undefined,
      division: formData.division || 'ديفيجن 2',
      manager: formData.manager || 'بيب غوارديولا',
      formation: formData.formation || '4-3-3',
      topPlayers: playersList.length > 0 ? playersList : ['ميسي إبيك'],
      description: formData.description || 'حساب مميز جاهز للعب مباشرة وتغيير البريد الإلكتروني.',
      konamiStatus: formData.konamiStatus || 'إيميل أساسي متاح للتغيير الفوري',
      guaranteeDays: Number(formData.guaranteeDays) || 30
    };

    if (isEditingAccount) {
      onUpdateAccount(completeAccount);
    } else {
      onAddAccount(completeAccount);
    }

    setIsAddingNew(false);
    setIsEditingAccount(null);
  };

  // Calculate Overview Stats
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const totalSalesSDG = completedOrders.reduce((sum, o) => sum + o.accountPriceSDG, 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchId = order.id.toLowerCase().includes(q);
      const matchAcc = order.accountTitle.toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchAcc;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative w-full max-w-6xl h-[92vh] bg-[#070b1a] border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#060916] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-blue-900 flex items-center justify-center text-slate-950 font-black shadow-md">
              MJ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">لوحة تحكم إدارة MJ STORE</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                  ADMIN v2.0
                </span>
              </div>
              <span className="text-xs text-slate-400">
                إدارة الحسابات، متابعة الطلبات، وتأكيد التحويلات
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUnlocked && (
              <button
                onClick={() => setIsAdminUnlocked(false)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>قفل اللوحة</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Security Gate / Passcode Check */}
        {!isAdminUnlocked ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#0a0f26] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">منطقة الإدارة المحمية</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                لوحة التحكم مخصصة لمدراء متجر MJ STORE لإدارة الحسابات والطلبات. يرجى إدخال رمز الأمان السري أو تسجيل الدخول ببريد الأدمن.
              </p>

              <form onSubmit={handleUnlockAdmin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="أدخل رمز الأدمن (MJ2026)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  />
                  {passcodeError && (
                    <span className="text-[11px] text-red-400 block mt-1.5 font-medium">
                      رمز الأمان غير صحيح، الرمز التجريبي هو: MJ2026
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-md transition-all active:scale-95"
                >
                  فتح لوحة الإدارة
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                الحسابات المرخصة: kanyky995@gmail.com أو رمز المرور السري MJ2026
              </div>
            </div>
          </div>
        ) : (
          /* Main Admin Content with Navigation Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Tabs */}
            <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 bg-[#070b1a] flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>نظرة عامة وإحصائيات</span>
              </button>

              <button
                onClick={() => setActiveTab('accounts')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'accounts'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>إدارة الحسابات ({accounts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إدارة الطلبات ({orders.length})</span>
                {pendingOrders.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono flex items-center justify-center font-black">
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('transactions')}
                className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'transactions'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>سجل المعاملات والتحويلات</span>
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#0a1128] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">إجمالي المبيعات المكتملة</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                        {totalSalesSDG.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400">SDG</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 block mt-1">
                      {completedOrders.length} طلبات تم تسليمها بنجاح
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a1128] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">الحسابات المعروضة في المتجر</span>
                    <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                      {accounts.length} حساب
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      تشكيلات eFootball 2026 جاهزة
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a1128] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">الطلبات قيد المراجعة</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                        {pendingOrders.length}
                      </span>
                      {pendingOrders.length > 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold animate-pulse">
                          تحتاج تدقيق
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      تتطلب إرسال الإشعار والتسليم
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0a1128] border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">متوسط سعر الحساب</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-400 font-mono tabular-nums">
                        {Math.round(
                          accounts.reduce((sum, a) => sum + a.priceSDG, 0) / (accounts.length || 1)
                        ).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400">SDG</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      معدل أسعار التشكيلات الحالية
                    </span>
                  </div>
                </div>

                {/* Quick Action & Recent Orders Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-[#090f24] border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>آخر الطلبات المسجلة</span>
                      </h4>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        عرض جميع الطلبات
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {orders.slice(0, 3).map((ord) => (
                        <div key={ord.id} className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{ord.customerName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</span>
                            </div>
                            <span className="text-xs text-slate-400 truncate max-w-sm block">
                              {ord.accountTitle}
                            </span>
                          </div>

                          <div className="text-left">
                            <span className="text-xs font-bold text-amber-400 font-mono tabular-nums block">
                              {ord.accountPriceSDG.toLocaleString()} SDG
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              ord.status === 'completed'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : ord.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-blue-500/15 text-blue-300'
                            }`}>
                              {ord.status === 'completed' ? 'تم التسليم' : ord.status === 'pending' ? 'قيد المراجعة' : 'جاري التحويل'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fast Action Box */}
                  <div className="bg-[#090f24] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>إجراءات سريعة</span>
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        أضف تشكيلات وبطاقات جديدة لمتجر MJ STORE فوراً بالصور والأسعار المناسبة بالجنيه السوداني.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setActiveTab('accounts');
                          handleOpenCreate();
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إدراج حساب جديد الآن</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('orders')}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>فحص طلبات بنكك المعلقة</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 2: Accounts Management */}
            {activeTab === 'accounts' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">تشكيلات وحسابات المتجر</h3>
                    <p className="text-xs text-slate-400">
                      يمكنك تعديل أي تفاصيل، تغيير الأسعار بالجنيه السوداني، أو إضافة حسابات جديدة مباشرة.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenCreate}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إدراج حساب eFootball جديد</span>
                  </button>
                </div>

                {/* Accounts Table */}
                <div className="bg-[#090f24] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#060a1a] text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">الحساب</th>
                          <th className="p-3.5">القوة والمنصة</th>
                          <th className="p-3.5">ميسي ورونالدو</th>
                          <th className="p-3.5">الكوينز والبوستر</th>
                          <th className="p-3.5">السعر (SDG)</th>
                          <th className="p-3.5 text-center">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {accounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={acc.image}
                                  alt={acc.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-white block max-w-xs truncate">{acc.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">#{acc.id}</span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold text-amber-400 font-mono block">قوة {acc.teamStrength}</span>
                              <span className="text-[11px] text-slate-400">
                                {acc.platform === 'mobile' ? 'موبايل' : 'كونسول'}
                              </span>
                            </td>

                            <td className="p-3.5 text-slate-300">
                              <div>{acc.messiCount} ميسي</div>
                              <div>{acc.ronaldoCount} رونالدو</div>
                            </td>

                            <td className="p-3.5 text-slate-300">
                              <div className="font-mono text-yellow-300">{acc.coins.toLocaleString()} Coins</div>
                              <div className="text-[11px] text-slate-400 font-mono">{acc.boosterCount} بوستر</div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold text-amber-400 font-mono text-sm block tabular-nums">
                                {acc.priceSDG.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-400">SDG</span>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEdit(acc)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                                  title="تعديل الحساب"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف الحساب "${acc.title}"؟`)) {
                                      onDeleteAccount(acc.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="حذف الحساب"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 3: Orders Management */}
            {activeTab === 'orders' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#090f24] p-3 rounded-xl border border-slate-800">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="بحث باسم العميل، الهاتف، أو رقم الطلب..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pr-9 pl-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    {(['all', 'pending', 'processing', 'completed', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'all'
                          ? 'الكل'
                          : st === 'pending'
                          ? 'قيد المراجعة'
                          : st === 'processing'
                          ? 'جاري التسليم'
                          : st === 'completed'
                          ? 'مكتمل'
                          : 'ملغي'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-3">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#090f24] border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400">{order.id}</span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="font-bold text-white text-sm">{order.customerName}</span>
                            <span className="text-xs font-mono text-slate-300">({order.customerPhone})</span>
                          </div>

                          <div className="text-xs text-slate-300">
                            <strong>الحساب المطلوب:</strong> {order.accountTitle} ({order.platform === 'mobile' ? 'موبايل' : 'كونسول'})
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>طريقة الدفع: <strong className="text-slate-200">{order.paymentMethod}</strong></span>
                            <span>·</span>
                            <span>التاريخ: <strong className="text-slate-200">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</strong></span>
                          </div>

                          {order.notes && (
                            <div className="text-[11px] text-amber-300/80 bg-amber-500/10 px-2 py-1 rounded inline-block">
                              ملاحظات: {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Price & Status Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                          <div className="text-right sm:text-left">
                            <span className="text-base font-black text-amber-400 font-mono tabular-nums block">
                              {order.accountPriceSDG.toLocaleString()} SDG
                            </span>
                          </div>

                          {/* WhatsApp Customer Button */}
                          <a
                            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>مراسلة العميل</span>
                          </a>

                          {/* Status Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="pending">⏳ قيد المراجعة</option>
                            <option value="processing">⚙️ جاري التسليم</option>
                            <option value="completed">✅ تم التسليم بنجاح</option>
                            <option value="cancelled">❌ ملغي</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">لا توجد طلبات تطابق الفلتر الحالي</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Tab 4: Transactions History */}
            {activeTab === 'transactions' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="bg-[#090f24] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-white mb-1">سجل التحويلات والعمليات المالية</h3>
                  <p className="text-xs text-slate-400 mb-5">
                    كشف حساب بالمعاملات المكتملة عبر وسائل الدفع المعتمدة (بنكك، أوكاش، ماي كاشي، برافو).
                  </p>

                  <div className="space-y-3">
                    {completedOrders.length > 0 ? (
                      completedOrders.map((ord) => (
                        <div key={ord.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-white text-xs">{ord.customerName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({ord.paymentMethod})</span>
                            </div>
                            <span className="text-xs text-slate-400 mt-1 block">
                              حساب: {ord.accountTitle}
                            </span>
                            {ord.transactionRef && (
                              <span className="text-[10px] text-emerald-400/90 font-mono block mt-0.5">
                                مرجع التحويل: {ord.transactionRef}
                              </span>
                            )}
                          </div>

                          <div className="text-left">
                            <span className="text-sm font-black text-emerald-400 font-mono tabular-nums block">
                              +{ord.accountPriceSDG.toLocaleString()} SDG
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(ord.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">لا توجد معاملات مكتملة بعد</p>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal: Add or Edit Account */}
        {(isAddingNew || isEditingAccount) && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="relative w-full max-w-2xl bg-[#090f26] border border-amber-500/40 rounded-2xl shadow-2xl p-6 my-6 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4">
                {isEditingAccount ? 'تعديل بيانات الحساب' : 'إدراج حساب eFootball جديد للمتجر'}
              </h3>

              <form onSubmit={handleSaveAccount} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      عنوان الحساب *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: حساب ملكي أساطير إبيك ديفيجن 1"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      السعر بالجنيه السوداني (SDG) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={formData.priceSDG || ''}
                      onChange={(e) => setFormData({ ...formData, priceSDG: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      قوة الفريق (Strength)
                    </label>
                    <input
                      type="number"
                      value={formData.teamStrength || ''}
                      onChange={(e) => setFormData({ ...formData, teamStrength: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      المنصة
                    </label>
                    <select
                      value={formData.platform || 'mobile'}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'mobile' | 'console' })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="mobile">موبايل (Android/iOS)</option>
                      <option value="console">كونسول / PC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      بطاقات ميسي
                    </label>
                    <input
                      type="number"
                      value={formData.messiCount || 0}
                      onChange={(e) => setFormData({ ...formData, messiCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      بطاقات رونالدو
                    </label>
                    <input
                      type="number"
                      value={formData.ronaldoCount || 0}
                      onChange={(e) => setFormData({ ...formData, ronaldoCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      نجوم البوستر (Booster Count)
                    </label>
                    <input
                      type="number"
                      value={formData.boosterCount || 0}
                      onChange={(e) => setFormData({ ...formData, boosterCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      رصيد الكوينز (Coins)
                    </label>
                    <input
                      type="number"
                      value={formData.coins || 0}
                      onChange={(e) => setFormData({ ...formData, coins: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      شارة مميزة (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: الأكثر مبيعاً ⭐"
                      value={formData.featuredBadge || ''}
                      onChange={(e) => setFormData({ ...formData, featuredBadge: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    أبرز اللاعبين والأساطير (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    placeholder="ميسي بوستر كأس العالم, رونالدو يونايتد, فييرا إبيك, خوليت"
                    value={topPlayersString}
                    onChange={(e) => setTopPlayersString(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      المدرب والتوافق
                    </label>
                    <input
                      type="text"
                      value={formData.manager || ''}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      أيام الضمان
                    </label>
                    <input
                      type="number"
                      value={formData.guaranteeDays || 30}
                      onChange={(e) => setFormData({ ...formData, guaranteeDays: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    وصف التشكيلة والحساب
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setIsEditingAccount(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                  >
                    حفظ الحساب في المتجر
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
