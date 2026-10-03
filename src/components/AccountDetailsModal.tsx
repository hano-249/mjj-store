import React from 'react';
import { EFootballAccount } from '../types';
import { X, ShieldCheck, Trophy, Sparkles, Smartphone, Gamepad2, Coins, ShoppingCart, Heart, Star } from 'lucide-react';

interface AccountDetailsModalProps {
  account: EFootballAccount | null;
  isWishlisted?: boolean;
  onToggleWishlist?: (account: EFootballAccount) => void;
  onClose: () => void;
  onBuy: (account: EFootballAccount) => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  isWishlisted = false,
  onToggleWishlist,
  onClose,
  onBuy
}) => {
  if (!account) return null;

  const playersText = account.playersDescription || account.description;
  const coachText = account.coach || account.manager;

  const hasSpecs = account.boosterCount !== undefined || account.coins !== undefined || account.gpPoints || account.division;
  const hasCoachOrFormation = coachText || account.formation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-[#0a0f24] border border-amber-500/30 rounded-2xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-950">
          <img
            src={account.squadImageBase64 || account.image}
            alt={account.title}
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f24] via-[#0a0f24]/50 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/90 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges on image */}
          <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2">
            {account.teamStrength && (
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-md shadow">
                قوة الفريق: {account.teamStrength}
              </span>
            )}
            {account.platform && (
              <span className="bg-blue-600/90 text-white font-semibold text-xs px-3 py-1 rounded-md">
                {account.platformLabel || account.platform}
              </span>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              {account.title}
            </h2>
            {account.subtitle && (
              <p className="text-xs text-slate-400 mb-2">{account.subtitle}</p>
            )}
          </div>

          {/* Quick Specifications Grid (Only if any spec exists) */}
          {hasSpecs && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
              {account.boosterCount !== undefined && (
                <div>
                  <span className="text-[11px] text-slate-400 block">نجوم البوستر:</span>
                  <span className="text-sm font-bold text-amber-400 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{account.boosterCount} لاعب بوستر</span>
                  </span>
                </div>
              )}
              {account.coins !== undefined && (
                <div>
                  <span className="text-[11px] text-slate-400 block">رصيد الكوينز:</span>
                  <span className="text-sm font-bold text-yellow-300 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{Number(account.coins).toLocaleString()} Coins</span>
                  </span>
                </div>
              )}
              {account.gpPoints && (
                <div>
                  <span className="text-[11px] text-slate-400 block">نقاط GP:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums mt-0.5 block">
                    {account.gpPoints} GP
                  </span>
                </div>
              )}
              {account.division && (
                <div>
                  <span className="text-[11px] text-slate-400 block">التصنيف / الديفيجن:</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">
                    {account.division}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Real Players & Squad Description */}
          {playersText && (
            <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>أبرز اللاعبين وتفاصيل التشكيلة:</span>
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {playersText}
              </p>
            </div>
          )}

          {/* Manager & Formation info (Only if either exists) */}
          {hasCoachOrFormation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-slate-300">
              {coachText && (
                <div>
                  <span className="text-slate-400 block">المدرب والتوافق:</span>
                  <strong className="text-amber-300 text-sm mt-0.5 block">{coachText}</strong>
                </div>
              )}
              {account.formation && (
                <div>
                  <span className="text-slate-400 block">الخطة الحالية:</span>
                  <strong className="text-white text-sm font-mono mt-0.5 block">{account.formation}</strong>
                </div>
              )}
            </div>
          )}

          {/* Konami & Guarantee Notice */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <p className="font-bold text-emerald-300 mb-0.5">ضمان التسليم والأمان:</p>
              <p>إيميل أساسي متاح للتغيير الكامل مع تسليم فوري وتأكيد استلام رسمي من متجر GUNNERS STORE.</p>
            </div>
          </div>

          {/* Modal Footer / Purchase Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-right w-full sm:w-auto">
              <span className="text-xs text-slate-400 block font-medium">السعر المطلوب:</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums">
                  {account.priceSDG.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-slate-300">جنيه سوداني (SDG)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(account)}
                  title={isWishlisted ? 'إزالة من المفضلة' : 'حفظ في قائمة الرغبات'}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-800'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
              >
                إغلاق
              </button>

              <button
                onClick={() => {
                  onClose();
                  onBuy(account);
                }}
                className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>شراء الحساب الآن</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
