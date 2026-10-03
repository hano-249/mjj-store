import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

interface PrivacyPageProps {
  onBackToStore: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBackToStore }) => {
  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#070b18]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-amber-500/20">
              GS
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-white block">GUNNERS STORE</span>
              <span className="text-[11px] text-emerald-400 font-medium">سياسة الخصوصية وحماية البيانات</span>
            </div>
          </div>

          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 rotate-180 text-amber-400" />
            <span>العودة للرئيسية</span>
          </button>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <article className="bg-[#070b1a] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-right">
          
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>خصوصية المستخدمين وأمان الحسابات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              سياسة الخصوصية - GUNNERS STORE
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              آخر تحديث: 2 أكتوبر 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            في <strong className="text-amber-400">GUNNERS STORE</strong> خصوصيتك أهم حاجة عندنا. الوثيقة دي بتوضح كيف بنتعامل مع بياناتك.
          </p>

          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>1. البيانات التي نجمعها</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 mb-2">
              عندما تسجل عن طريق "المتابعة باستخدام Google" نحن نجمع فقط:
            </p>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-6 list-disc list-inside space-y-1">
              <li>اسمك الظاهر</li>
              <li>عنوان بريدك الإلكتروني (Gmail)</li>
              <li>صورتك الشخصية من جوجل (للعرض فقط)</li>
            </ul>
            <p className="text-xs sm:text-sm text-amber-300 font-semibold pr-4 mt-2">
              *نحن لا نجمع أبداً:* كلمات مرور إيميلك الشخصي، أو أرقام بطاقاتك البنكية (الدفع يتم خارج الموقع عبر الواتساب)، أو موقعك الجغرافي الدقيق.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>2. كيف نستخدم بياناتك؟</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>لإنشاء حسابك في المتجر وعرض طلباتك السابقة.</li>
              <li>للتواصل معك بخصوص تسليم الحسابات عبر الواتساب.</li>
              <li>لتحسين تجربة الموقع ومنع الحسابات الوهمية.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>3. هل نشارك بياناتك؟</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              <strong className="text-white">لا، إطلاقاً.</strong> لا نبيع ولا نؤجر ولا نشارك إيميلك أو اسمك مع أي شركة أو شخص أو خدمة إعلانات. بياناتك تبقى داخل قاعدة بيانات Firebase الآمنة الخاصة بنا فقط.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>4. ملفات تعريف الارتباط (Cookies)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              الموقع يستخدم Cookies بسيطة جداً من Firebase و Netlify فقط لتذكر أنك مسجل دخول. لا نستخدم كوكيز تتبع إعلاني.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>5. أمان البيانات</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              نحن نستخدم حماية Firebase Authentication من Google، وهي نفس الحماية التي تستخدمها جوجل نفسها. جميع بيانات تسليم الحسابات مشفرة. ورغم ذلك، تذكر أن بيع حسابات الألعاب يتم خارج منصة KONAMI، لذا يجب عليك تغيير بيانات الحساب فور استلامه.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>6. حقوقك</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 mb-1">
              يحق لك في أي وقت:
            </p>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-6 list-disc list-inside space-y-1">
              <li>طلب حذف حسابك وجميع بياناتك نهائياً من المتجر.</li>
              <li>طلب معرفة البيانات التي نحتفظ بها عنك.</li>
            </ul>
            <p className="text-xs text-slate-400 pr-4 mt-1">
              فقط راسلنا على واتساب الدعم.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>7. خصوصية الأطفال</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              المتجر غير موجه للأطفال دون 13 سنة. لا نجمع بيانات أطفال عن قصد.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>8. التواصل</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              إذا عندك أي سؤال حول الخصوصية، تواصل معنا عبر واتساب GUNNERS STORE.
            </p>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">باستخدامك للموقع، أنت توافق على هذه السياسة.</span>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>أمان وموثوقية معتمدة</span>
            </div>
          </div>

        </article>
      </main>

    </div>
  );
};
