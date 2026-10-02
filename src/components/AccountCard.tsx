import React, { useState } from 'react';
import { EFootballAccount } from '../types';
import { ShieldCheck, Coins, Eye, ShoppingCart, Smartphone, Gamepad2, Star, Sparkles, Heart } from 'lucide-react';

interface AccountCardProps {
  account: EFootballAccount;
  isWishlisted?: boolean;
  onToggleWishlist?: (account: EFootballAccount) => void;
  onBuyClick: (account: EFootballAccount) => void;
  onViewDetails: (account: EFootballAccount) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isWishlisted = false,
  onToggleWishlist,
  onBuyClick,
  onViewDetails
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative bg-[#090e21] rounded-2xl border border-slate-800/80 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Featured Tag */}
      {account.featuredBadge && (
        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] px-2.5 py-1 rounded-md shadow-md shadow-black/50">
          {account.featuredBadge}
        </div>
      )}

      {/* Top Left actions: Platform Badge + Wishlist Heart button */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
        <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 text-[10px] font-semibold px-2 py-1 rounded-md flex items-center gap-1">
          {account.platform === 'mobile' ? (
            <>
              <Smartphone className="w-3 h-3 text-amber-400" />
              <span>موبايل</span>
            </>
          ) : (
            <>
              <Gamepad2 className="w-3 h-3 text-blue-400" />
              <span>كونسول</span>
            </>
          )}
        </div>

        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(account);
            }}
            title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى قائمة الرغبات'}
            className={`p-1.5 rounded-md backdrop-blur-md border transition-all ${
              isWishlisted
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-slate-950/80 border-slate-700/60 text-slate-400 hover:text-red-400 hover:bg-slate-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Header Media */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onViewDetails(account)}>
        {!imgError ? (
          <img
            src={account.image}
            alt={account.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-slate-900 text-center p-4">
            <Sparkles className="w-10 h-10 text-amber-400 mb-2 opacity-80" />
            <span className="text-xs text-amber-300 font-bold">تشكيلة eFootball 2026</span>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">{account.teamStrength} قوة الفريق</span>
          </div>
        )}

        {/* Media Overlay Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090e21] via-transparent to-transparent opacity-90" />

        {/* Team Strength Floating Badge (High contrast) */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#070c1d]/90 backdrop-blur-md border border-amber-400/40 px-2.5 py-1 rounded-lg shadow-lg">
          <span className="text-[10px] text-amber-300 font-medium">القوة الإجمالية:</span>
          <span className="text-base font-black text-amber-400 font-mono tabular-nums tracking-wide">
            {account.teamStrength}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <span className="text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <strong className="font-mono tabular-nums">{account.boosterCount}</strong> بوستر
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{account.division}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-blue-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span className="font-mono tabular-nums">{account.coins.toLocaleString()}</span> كوينز
            </span>
          </div>

          {/* Account Title */}
          <h3 
            onClick={() => onViewDetails(account)}
            className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer mb-1.5"
          >
            {account.title}
          </h3>

          {/* Subtitle / Key Hook */}
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {account.subtitle}
          </p>

          {/* Star Legends Specs (Messi & Ronaldo counts) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">بطاقات ميسي ورونالدو:</span>
              <span className="font-semibold text-white">
                {account.messiCount > 0 ? `${account.messiCount} ميسي` : 'بدون ميسي'}
                {account.messiCount > 0 && account.ronaldoCount > 0 && ' + '}
                {account.ronaldoCount > 0 ? `${account.ronaldoCount} رونالدو` : ''}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">المدرب والتكتيك:</span>
              <span className="font-semibold text-amber-300/90 truncate max-w-[160px]">
                {account.manager}
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer: Price & Actions */}
        <div className="pt-3 border-t border-slate-800/80">
          
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">السعر المطلوب:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums">
                  {account.priceSDG.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-300">SDG</span>
              </div>
            </div>

            <div className="text-left text-[10px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ضمان {account.guaranteeDays} يوم</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(account)}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/80 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>التفاصيل</span>
            </button>

            <button
              onClick={() => onBuyClick(account)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>اشتري الآن</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
