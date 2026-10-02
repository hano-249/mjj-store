import React, { useState, useEffect, useMemo } from 'react';
import { auth, onAuthStateChanged, provider, signInWithPopup } from './firebase';
import { UserProfile, EFootballAccount, FilterState, CustomerOrder, OrderStatus } from './types';
import { INITIAL_ACCOUNTS } from './data/accounts';
import { INITIAL_ORDERS } from './data/orders';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { AccountCard } from './components/AccountCard';
import { AccountDetailsModal } from './components/AccountDetailsModal';
import { BuyModal } from './components/BuyModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AdminPanel } from './components/AdminPanel';
import { SecretAdminPage } from './pages/SecretAdminPage';
import { TrustSection } from './components/TrustSection';
import { PaymentMethodsSection } from './components/PaymentMethodsSection';
import { FaqSection } from './components/FaqSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Trophy, Flame, RotateCcw, Heart, AlertCircle, X } from 'lucide-react';

const checkIsSecretAdminPath = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.replace(/\/+$/, '');
  const hash = window.location.hash.replace(/\/+$/, '');
  return (
    path === '/mj-khalid-77-store-2026' ||
    hash === '#/mj-khalid-77-store-2026' ||
    hash === '#mj-khalid-77-store-2026'
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Secret route state for /mj-khalid-77-store-2026
  const [isSecretAdminRoute, setIsSecretAdminRoute] = useState<boolean>(() => checkIsSecretAdminPath());

  // Listen to popstate and hashchange for URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsSecretAdminRoute(checkIsSecretAdminPath());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateToSecretAdmin = () => {
    window.history.pushState({}, '', '/mj-khalid-77-store-2026');
    setIsSecretAdminRoute(true);
  };

  const navigateBackToStore = () => {
    window.history.pushState({}, '', '/');
    setIsSecretAdminRoute(false);
  };

  // Accounts state with persistence
  const [accounts, setAccounts] = useState<EFootballAccount[]>(() => {
    const saved = localStorage.getItem('mj_store_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback to initial
      }
    }
    return INITIAL_ACCOUNTS;
  });

  // Orders state with persistence
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('mj_store_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback to initial
      }
    }
    return INITIAL_ORDERS;
  });

  // Modals state
  const [selectedDetailsAccount, setSelectedDetailsAccount] = useState<EFootballAccount | null>(null);
  const [selectedBuyAccount, setSelectedBuyAccount] = useState<EFootballAccount | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Wishlist IDs per user
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Filter state (Simple single-row: search, platform, price range)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    platform: 'all',
    priceRange: 'all'
  });

  // Persist accounts whenever changed
  useEffect(() => {
    localStorage.setItem('mj_store_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Persist orders whenever changed
  useEffect(() => {
    localStorage.setItem('mj_store_orders', JSON.stringify(orders));
  }, [orders]);

  // Listen to Firebase auth state & restore user
  useEffect(() => {
    const storedPreviewUser = localStorage.getItem('mj_store_preview_user');
    if (storedPreviewUser) {
      try {
        setUser(JSON.parse(storedPreviewUser));
      } catch (e) {
        // ignore parse error
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
        localStorage.removeItem('mj_store_preview_user');
      } else {
        const stillInPreview = localStorage.getItem('mj_store_preview_user');
        if (!stillInPreview) {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync wishlist for current user
  useEffect(() => {
    const storageKey = user ? `mj_store_wishlist_${user.uid}` : 'mj_store_wishlist_guest';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch (e) {
        setWishlistIds([]);
      }
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  // Save wishlist changes
  const saveWishlist = (newIds: string[]) => {
    setWishlistIds(newIds);
    const storageKey = user ? `mj_store_wishlist_${user.uid}` : 'mj_store_wishlist_guest';
    localStorage.setItem(storageKey, JSON.stringify(newIds));
  };

  const showNotification = (msg: string) => {
    setWishlistToast(msg);
    setTimeout(() => setWishlistToast(null), 3500);
  };

  // Toggle wishlist handler
  const handleToggleWishlist = (account: EFootballAccount) => {
    if (!user) {
      showNotification('يرجى تسجيل الدخول أولاً عبر Google لإضافة الحساب إلى قائمة الرغبات الخاصة بك.');
      return;
    }

    const exists = wishlistIds.includes(account.id);
    if (exists) {
      const nextIds = wishlistIds.filter((id) => id !== account.id);
      saveWishlist(nextIds);
      showNotification(`تمت إزالة "${account.title}" من قائمة الرغبات.`);
    } else {
      const nextIds = [...wishlistIds, account.id];
      saveWishlist(nextIds);
      showNotification(`تمت إضافة "${account.title}" إلى قائمة الرغبات بنجاح!`);
    }
  };

  const handleRemoveFromWishlist = (accountId: string) => {
    const nextIds = wishlistIds.filter((id) => id !== accountId);
    saveWishlist(nextIds);
  };

  // Admin Account Actions
  const handleAddAccount = (newAcc: EFootballAccount) => {
    setAccounts((prev) => [newAcc, ...prev]);
    showNotification(`تم إدراج الحساب الجديد "${newAcc.title}" بنجاح في متجر MJ STORE!`);
  };

  const handleUpdateAccount = (updatedAcc: EFootballAccount) => {
    setAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    showNotification(`تم تحديث بيانات الحساب "${updatedAcc.title}" بنجاح!`);
  };

  const handleDeleteAccount = (accountId: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setWishlistIds((prev) => prev.filter((id) => id !== accountId));
    showNotification('تم حذف الحساب من المتجر بنجاح.');
  };

  // Admin Order Actions
  const handleOrderCreated = (order: CustomerOrder) => {
    setOrders((prev) => [order, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            notes: notes !== undefined ? notes : ord.notes
          };
        }
        return ord;
      })
    );
    showNotification(`تم تحديث حالة الطلب #${orderId} إلى: ${status}`);
  };

  const handlePreviewLogin = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('mj_store_preview_user', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('mj_store_preview_user');
  };

  // Filter accounts (Automatic sorting: Newest first)
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // 1. Platform filter
      if (filters.platform !== 'all' && acc.platform !== filters.platform) {
        return false;
      }

      // 2. Dynamic Price range filter (No 200k cap)
      if (filters.priceRange === 'under-50k' && acc.priceSDG >= 50000) {
        return false;
      }
      if (filters.priceRange === '50k-150k' && (acc.priceSDG < 50000 || acc.priceSDG > 150000)) {
        return false;
      }
      if (filters.priceRange === 'above-150k' && acc.priceSDG <= 150000) {
        return false;
      }

      // 3. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchTitle = acc.title.toLowerCase().includes(q);
        const matchSubtitle = acc.subtitle?.toLowerCase().includes(q);
        const matchManager = acc.manager?.toLowerCase().includes(q);
        const matchPlayers = acc.topPlayers?.some((p) => p.toLowerCase().includes(q));
        const matchId = acc.id.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchManager && !matchPlayers && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [accounts, filters]);

  // Wishlist Accounts objects
  const wishlistAccounts = useMemo(() => {
    return accounts.filter((a) => wishlistIds.includes(a.id));
  }, [accounts, wishlistIds]);

  // WhatsApp general contact
  const handleOpenWhatsApp = (customText?: string) => {
    const text = customText || 'السلام عليكم متجر MJ STORE، أود الاستفسار وطلب حساب eFootball 2026.';
    const url = `https://wa.me/249916952608?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const scrollToAccounts = () => {
    const el = document.getElementById('accounts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isSecretAdminRoute) {
    return (
      <SecretAdminPage onBackToStore={navigateBackToStore} />
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {wishlistToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-[#0a1128]/95 border border-amber-400/50 shadow-2xl shadow-black p-3.5 rounded-xl text-center text-xs text-amber-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span>{wishlistToast}</span>
          </div>
          <button
            onClick={() => setWishlistToast(null)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={navigateToSecretAdmin}
        onPreviewLogin={handlePreviewLogin}
        onSignOut={handleSignOut}
      />

      {/* Hero Banner */}
      <HeroBanner
        onBrowseClick={scrollToAccounts}
        onWhatsAppClick={() => handleOpenWhatsApp()}
      />

      {/* Main Accounts Catalog Section */}
      <main id="accounts" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>تشكيلات حصرية وجاهزة للتسليم</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
              أقوى تشكيلات <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">eFootball 2026</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
            جميع الحسابات مضمونة تسليم فوري مع إيميل أساسي وتغيير كامل للبيانات، أسعار منافسة بالجنيه السوداني SDG.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          totalCount={accounts.length}
          filteredCount={filteredAccounts.length}
        />

        {/* Accounts Grid */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                isWishlisted={wishlistIds.includes(account.id)}
                onToggleWishlist={handleToggleWishlist}
                onBuyClick={(acc) => setSelectedBuyAccount(acc)}
                onViewDetails={(acc) => setSelectedDetailsAccount(acc)}
              />
            ))}
          </div>
        ) : (
          /* Empty Filter State */
          <div className="text-center py-16 px-4 bg-[#0a0f24] rounded-2xl border border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">لا توجد حسابات مطابقة للبحث</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              جرب تغيير كلمات البحث أو اختيار نطاق سعر مختلف، أو تواصل معنا لتوفير حساب بمواصفاتك الخاصة فوراً.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    platform: 'all',
                    priceRange: 'all'
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
              <button
                onClick={() => handleOpenWhatsApp('السلام عليكم، أبحث عن حساب بمواصفات خاصة')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300"
              >
                <span>طلب حساب مخصص عبر واتساب</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Trust & Guarantee Section */}
      <TrustSection />

      {/* Payment Methods Section (Bankak & others) */}
      <PaymentMethodsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Footer */}
      <Footer onNavigateToSecretAdmin={navigateToSecretAdmin} />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp onChatClick={() => handleOpenWhatsApp()} />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistAccounts={wishlistAccounts}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onBuyAccount={(acc) => {
          setIsWishlistOpen(false);
          setSelectedBuyAccount(acc);
        }}
        onViewDetails={(acc) => {
          setIsWishlistOpen(false);
          setSelectedDetailsAccount(acc);
        }}
      />

      {/* Account Full Details Modal */}
      <AccountDetailsModal
        account={selectedDetailsAccount}
        isWishlisted={selectedDetailsAccount ? wishlistIds.includes(selectedDetailsAccount.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onClose={() => setSelectedDetailsAccount(null)}
        onBuy={(acc) => setSelectedBuyAccount(acc)}
      />

      {/* Buy / Checkout Modal */}
      <BuyModal
        account={selectedBuyAccount}
        user={user}
        onOrderCreated={handleOrderCreated}
        onClose={() => setSelectedBuyAccount(null)}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        accounts={accounts}
        orders={orders}
        currentUser={user}
        onAddAccount={handleAddAccount}
        onUpdateAccount={handleUpdateAccount}
        onDeleteAccount={handleDeleteAccount}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
