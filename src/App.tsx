import React, { useState, useEffect, useMemo } from 'react';
import { auth, onAuthStateChanged, provider, signInWithPopup, db } from './firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { UserProfile, EFootballAccount, FilterState } from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { AccountCard } from './components/AccountCard';
import { AccountDetailsModal } from './components/AccountDetailsModal';
import { BuyModal } from './components/BuyModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SecretAdminPage } from './pages/SecretAdminPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsConsentModal } from './components/TermsConsentModal';
import { TrustSection } from './components/TrustSection';
import { PaymentMethodsSection } from './components/PaymentMethodsSection';
import { FaqSection } from './components/FaqSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Trophy, Flame, RotateCcw, Heart, X } from 'lucide-react';

type RouteState = 'store' | 'admin' | 'terms' | 'privacy';

const getCurrentRoute = (): RouteState => {
  if (typeof window === 'undefined') return 'store';
  const p = window.location.pathname.replace(/\/+$/, '');
  const h = window.location.hash.replace(/\/+$/, '');

  if (p === '/terms' || h === '#/terms' || h === '#terms') return 'terms';
  if (p === '/privacy' || h === '#/privacy' || h === '#privacy') return 'privacy';
  if (
    p === '/mj-khalid-77' ||
    p === '/mj-khalid-77-store-2026' ||
    h === '#/mj-khalid-77' ||
    h === '#/mj-khalid-77-store-2026' ||
    h === '#mj-khalid-77' ||
    h === '#mj-khalid-77-store-2026'
  ) {
    return 'admin';
  }
  return 'store';
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Dynamic admin verification state
  const [isAdmin, setIsAdmin] = useState(false);

  // Route state
  const [currentRoute, setCurrentRoute] = useState<RouteState>(() => getCurrentRoute());

  // Accounts state - loaded from Firestore collection 'accounts'
  const [accounts, setAccounts] = useState<EFootballAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Modals state
  const [selectedDetailsAccount, setSelectedDetailsAccount] = useState<EFootballAccount | null>(null);
  const [selectedBuyAccount, setSelectedBuyAccount] = useState<EFootballAccount | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);

  // Terms & Privacy Consent Modal State for Google Sign In
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Wishlist IDs per user
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    platform: 'all',
    priceRange: 'all'
  });

  // Listen to popstate and hashchange for URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(getCurrentRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateToStore = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoute('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTerms = () => {
    window.history.pushState({}, '', '/terms');
    setCurrentRoute('terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = () => {
    window.history.pushState({}, '', '/privacy');
    setCurrentRoute('privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/mj-khalid-77');
    setCurrentRoute('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Sign In with Terms Consent flow
  const handleInitiateGoogleSignIn = () => {
    setAuthError(null);
    setIsConsentModalOpen(true);
  };

  const handleAgreeAndContinueGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await signInWithPopup(auth, provider);
      setIsConsentModalOpen(false);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else if (error?.code === 'auth/popup-blocked') {
        setAuthError('يرجى السماح بالنوافذ المنبثقة لإتمام تسجيل الدخول.');
      } else {
        setAuthError('تعذر تسجيل الدخول حالياً، يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Dynamic admin verification via Firestore 'admins' collection
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const ref = doc(db, "admins", user.uid);
        const snap = await getDoc(ref);
        setIsAdmin(snap.exists());
      } catch (err) {
        console.error('Error checking admin:', err);
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user]);

  // Live Firestore accounts synchronization
  useEffect(() => {
    setLoadingAccounts(true);
    let unsub = () => {};

    try {
      const q = collection(db, 'accounts');
      unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: EFootballAccount[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            const isSold = d.status === 'مباع' || d.sold === true;
            if (!isSold) {
              const ratingNum = parseInt(d.rating || d.teamStrength || '3150', 10) || 3150;
              const imgUrl = d.squadImageBase64 || d.image || '/src/assets/images/squad_showcase_legends_1790969434039.jpg';
              list.push({
                id: docSnap.id,
                title: d.title || 'حساب eFootball 2026',
                subtitle: d.description || '',
                priceSDG: Number(d.price) || 0,
                teamStrength: ratingNum,
                boosterCount: Number(d.boosterCount) || 5,
                messiCount: Number(d.messiCount) || 1,
                ronaldoCount: Number(d.ronaldoCount) || 1,
                coins: Number(d.coins) || 0,
                gpPoints: d.gpPoints || '1M',
                platform: d.game?.toLowerCase().includes('console') ? 'console' : 'mobile',
                platformLabel: d.status === 'محجوز' ? 'محجوز لعميل' : 'موبايل (Android / iOS)',
                featuredBadge: d.status === 'محجوز' ? 'محجوز لعميل 🟡' : undefined,
                image: imgUrl,
                squadImageBase64: d.squadImageBase64 || d.image,
                division: d.division || 'ديفيجن 1',
                manager: d.manager || 'تشكيلة أساطير',
                formation: d.formation || '4-3-3',
                topPlayers: Array.isArray(d.topPlayers)
                  ? d.topPlayers
                  : (d.description ? [d.description] : ['نجوم الأساطير']),
                description: d.description || '',
                konamiStatus: 'تسليم يدوي فوري ومباشر عبر واتساب',
                guaranteeDays: 30
              });
            }
          });
          setAccounts(list);
          setLoadingAccounts(false);
        },
        () => {
          setLoadingAccounts(false);
        }
      );
    } catch {
      setLoadingAccounts(false);
    }

    return () => unsub();
  }, []);

  // Sync wishlist for current user
  useEffect(() => {
    const storageKey = user ? `mj_store_wishlist_${user.uid}` : 'mj_store_wishlist_guest';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setWishlistIds(JSON.parse(saved));
      } catch {
        setWishlistIds([]);
      }
    } else {
      setWishlistIds([]);
    }
  }, [user]);

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
      showNotification('يرجى تسجيل الدخول أولاً لإضافة الحساب إلى قائمة الرغبات الخاصة بك.');
      handleInitiateGoogleSignIn();
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

  const handleSignOut = () => {
    setUser(null);
  };

  // Filter accounts (Automatic sorting: Newest first)
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // 1. Platform filter
      if (filters.platform !== 'all' && acc.platform !== filters.platform) {
        return false;
      }

      // 2. Dynamic Price range filter (No cap)
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
    const text = customText || 'السلام عليكم متجر GUNNERS STORE، أود الاستفسار وطلب حساب eFootball 2026.';
    const url = `https://wa.me/249916952608?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const scrollToAccounts = () => {
    const el = document.getElementById('accounts');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Terms Page Route
  if (currentRoute === 'terms') {
    return <TermsPage onBackToStore={navigateToStore} />;
  }

  // 2. Privacy Policy Page Route
  if (currentRoute === 'privacy') {
    return <PrivacyPage onBackToStore={navigateToStore} />;
  }

  // 3. Secret Admin Route (Dynamic Authorization via 'admins' Firestore collection)
  if (currentRoute === 'admin') {
    if (loadingAuth) {
      return (
        <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-6 text-center font-['Cairo',sans-serif]">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-['Cairo',sans-serif]">
          <div className="max-w-md w-full bg-[#080d21] border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-6xl font-black text-amber-400 mb-3 font-mono">404</div>
            <h2 className="text-xl font-bold text-white mb-2">الصفحة غير موجودة</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم تغيير مسارها.
            </p>
            <button
              onClick={navigateToStore}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors"
            >
              العودة للمتجر الرئيسي
            </button>
          </div>
        </div>
      );
    }

    return (
      <SecretAdminPage
        user={user!}
        onBackToStore={navigateToStore}
        onSignOut={handleSignOut}
      />
    );
  }

  // 4. Main Store View
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {wishlistToast && (
        <div className="fixed top-24 inset-x-4 max-w-md mx-auto z-50 bg-[#0a1128]/95 border border-amber-400/50 shadow-2xl shadow-black p-3.5 rounded-xl text-center text-xs text-amber-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
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
        isAdmin={isAdmin}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAdmin={isAdmin ? navigateToAdmin : undefined}
        onInitiateSignIn={handleInitiateGoogleSignIn}
        onSignOut={handleSignOut}
        authError={authError}
      />

      {/* Hero Banner */}
      <HeroBanner
        onBrowseClick={scrollToAccounts}
        onWhatsAppClick={() => handleOpenWhatsApp()}
      />

      {/* Main Accounts Catalog Section */}
      <main id="accounts" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {/* Hidden SEO H1 Heading */}
        <h1 style={{ position: 'absolute', left: '-9999px' }}>
          متجر حسابات بيس السودان - GUNNERS STORE - حسابات eFootball قوية
        </h1>
        
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
        {loadingAccounts ? (
          <div className="text-center py-20 bg-[#0a0f24] rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">جارٍ تحميل الحسابات المتاحة من قاعدة البيانات...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
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
          /* Empty Catalog or Search State */
          <div className="text-center py-16 px-4 bg-[#0a0f24] rounded-2xl border border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">
              {accounts.length === 0 ? 'لا توجد حسابات معروضة حالياً' : 'لا توجد حسابات مطابقة للبحث'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              {accounts.length === 0
                ? 'ترقبوا تشكيلات وحسابات أسطورية جديدة قريباً، أو تواصل معنا مباشرة لتوفير حساب بمواصفاتك الخاصة.'
                : 'جرب تغيير كلمات البحث أو اختيار نطاق سعر مختلف، أو تواصل معنا لتوفير حساب بمواصفاتك الخاصة فوراً.'}
            </p>
            <div className="flex justify-center gap-3">
              {accounts.length > 0 && (
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
              )}
              <button
                onClick={() => handleOpenWhatsApp('السلام عليكم متجر GUNNERS STORE، أود طلب حساب بمواصفات خاصة')}
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
      <Footer 
        onNavigateToTerms={navigateToTerms}
        onNavigateToPrivacy={navigateToPrivacy}
      />

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
        onClose={() => setSelectedBuyAccount(null)}
      />

      {/* Terms & Privacy Consent Modal before Google Sign In */}
      <TermsConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAgreeAndContinue={handleAgreeAndContinueGoogleSignIn}
        onNavigateToTerms={navigateToTerms}
        onNavigateToPrivacy={navigateToPrivacy}
        isSigningIn={isSigningIn}
      />
    </div>
  );
}
