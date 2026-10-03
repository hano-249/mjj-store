import React from 'react';
import { ShieldCheck, Zap, Award, Star, ArrowDown, MessageCircle } from 'lucide-react';

interface HeroBannerProps {
  onBrowseClick: () => void;
  onWhatsAppClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onBrowseClick, onWhatsAppClick }) => {
  return (
    <section id="home" className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-amber-500/10">
      {/* Background Image with Dark Royal Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_efootball_banner_1790969421680.jpg"
          alt="eFootball 2026 Gaming Arena"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 filter brightness-75 contrast-125"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/90 via-[#070d24]/80 to-[#050811]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Subtle Trust Tag (Clean unboxed inline text) */}
          <div className="inline-flex max-w-full items-center gap-2 text-xs sm:text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full mb-6 shadow-sm overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">تسليم فوري عبر واتساب: 2608 695 91 249+</span>
            <span aria-hidden="true" className="text-amber-500/60 shrink-0">·</span>
            <span className="truncate">الدفع عبر: بنكك، أوكاش، ماي كاشي، برافو</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            أقوى حسابات <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">eFootball 2026</span>
            <br />
            <span className="text-2xl sm:text-4xl lg:text-5xl text-blue-200 font-extrabold mt-2 block">
              مضمونة 100% مع ضمان استرجاع
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            امتلك تشكيلة أحلامك مع أساطير الإبيك والشو تايم (ميسي، رونالدو، فييرا، خوليت). 
            حسابات مرتبطة بكونامي آيدي أصلي مع إمكانية التغيير الكامل والآمن لكافة البيانات.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onBrowseClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-150"
            >
              <span>تصفح الحسابات المتاحة</span>
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </button>

            <button
              onClick={onWhatsAppClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 rounded-xl shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>استفسار أو طلب خاص عبر واتساب</span>
            </button>
          </div>

          {/* Value Proof Badges (Claim-to-Proof Adjacency) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Zap className="w-5 h-5 text-amber-400 mb-1.5" />
              <span className="text-xs text-slate-400 font-medium">سرعة التسليم</span>
              <span className="text-sm font-bold text-white">فوري 5 دقائق</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1.5" />
              <span className="text-xs text-slate-400 font-medium">ضمان الحساب</span>
              <span className="text-sm font-bold text-white">ضمان شامل ومكتوب</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Award className="w-5 h-5 text-blue-400 mb-1.5" />
              <span className="text-xs text-slate-400 font-medium">حسابات تم بيعها</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">+1,200 حساب</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1.5" />
              <span className="text-xs text-slate-400 font-medium">تقييم المشترين</span>
              <span className="text-sm font-bold text-white font-mono tabular-nums">4.9 / 5.0</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
