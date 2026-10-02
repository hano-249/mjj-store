import React from 'react';
import { EFootballAccount } from '../types';
import { X, Heart, ShoppingCart, Trash2, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistAccounts: EFootballAccount[];
  onRemoveFromWishlist: (accountId: string) => void;
  onBuyAccount: (account: EFootballAccount) => void;
  onViewDetails: (account: EFootballAccount) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistAccounts,
  onRemoveFromWishlist,
  onBuyAccount,
  onViewDetails
}) => {
  if (!isOpen) return null;

  const totalValue = wishlistAccounts.reduce((sum, acc) => sum + acc.priceSDG, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-[#080d22] border-r border-amber-500/30 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#060a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Heart className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">قائمة الرغبات (Wishlist)</h3>
              <span className="text-xs text-slate-400">
                {wishlistAccounts.length} {wishlistAccounts.length === 1 ? 'حساب محفوظ' : 'حسابات محفوظة'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlistAccounts.length > 0 ? (
            wishlistAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-[#0b122c] border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition-all group flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={account.image}
                    alt={account.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onViewDetails(account);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        onClose();
                        onViewDetails(account);
                      }}
                      className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {account.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="text-amber-400 font-mono font-bold">قوة {account.teamStrength}</span>
                      <span aria-hidden="true">·</span>
                      <span>{account.platform === 'mobile' ? 'موبايل' : 'كونسول'}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-sm font-black text-amber-400 font-mono tabular-nums">
                        {account.priceSDG.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">SDG</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromWishlist(account.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="إزالة من المفضلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      onClose();
                      onViewDetails(account);
                    }}
                    className="py-1.5 px-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors"
                  >
                    عرض التفاصيل
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onBuyAccount(account);
                    }}
                    className="py-1.5 px-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>شراء الحساب</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">قائمة الرغبات فارغة</h4>
              <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                اضغط على أيقونة القلب في أي كرت حساب لحفظه هنا والرجوع إليه وشرائه في أي وقت.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors"
              >
                تصفح تشكيلات eFootball
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer with Subtotal & Quick Buy */}
        {wishlistAccounts.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-[#060a1a]">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs text-slate-400">القيمة الإجمالية للمفضلة:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                  {totalValue.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400">SDG</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>جميع الحسابات محفوظة في جلستك وجاهزة للشراء الفوري.</span>
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
            >
              متابعة التسوق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
