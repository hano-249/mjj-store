import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface TermsPageProps {
  onBackToStore: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToStore }) => {
  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 font-['Cairo',sans-serif] selection:bg-amber-500 selection:text-black">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#070b18]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              MJ
            </div>
            <div>
              <span className="text-base sm:text-lg font-black text-white block">MJ STORE</span>
              <span className="text-[11px] text-amber-400 font-medium">الشروط والأحكام الرسمية</span>
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
        <article className="bg-[#070b1a] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-right">
          
          {/* Document Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>اتفاقية الاستخدام والبيع الرقمي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              شروط الاستخدام وسياسة البيع - MJ STORE
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              آخر تحديث: 2 أكتوبر 2026
            </p>
          </div>

          {/* Intro */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            مرحباً بك في <strong className="text-amber-400">MJ STORE</strong>. باستخدامك للموقع وتسجيلك عن طريق Google أنت توافق على هذه الشروط بالكامل.
          </p>

          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>1. طبيعة الخدمة</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              MJ STORE متجر رقمي متخصص في بيع حسابات لعبة eFootball™. نحن نعرض حسابات مجمعة ونقوم بتسليمها للعميل بعد الدفع. نحن لسنا تابعين لشركة KONAMI الرسمية.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>2. التسليم والملكية</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>التسليم فوري خلال 5 - 30 دقيقة بعد تأكيد الدفع عبر الواتساب.</li>
              <li>يتم تسليم الحساب بالإيميل الأساسي وكلمة السر. بعد التسليم يصبح العميل هو المالك الكامل ومسؤول عن تغيير الإيميل والباسورد فوراً.</li>
              <li>ننصح بتغيير جميع بيانات الأمان فور الاستلام.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>3. سياسة الدفع والاسترجاع</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>جميع المنتجات رقمية، لذلك <strong className="text-amber-300">البيع نهائي بعد تسليم بيانات الحساب</strong>.</li>
              <li>لا يوجد استرجاع في الحالات التالية: إذا قمت بالدخول للحساب، أو تغيير بياناته، أو لعب مباراة واحدة، أو ربطه بحسابك.</li>
              <li>يحق لك طلب استرجاع كامل فقط إذا لم نتمكن من تسليمك الحساب خلال 24 ساعة، أو كان الحساب لا يعمل قبل تسليمه لك (مع فيديو إثبات قبل تغيير أي شيء).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>4. الضمان</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>نضمن أن الحساب كما هو موضح في الصور والوصف (عدد الكوينز، اللاعبين، قوة الفريق) لحظة التسليم.</li>
              <li>لا نتحمل مسؤولية حظر الحساب بسبب استخدام برامج غش أو مشاركة الحساب أو مخالفة قوانين KONAMI بعد التسليم.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>5. خصوصية البيانات</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>عند التسجيل بجوجل نحن نجمع فقط اسمك وصورتك وإيميلك لتسهيل الطلبات.</li>
              <li><strong className="text-emerald-300">نحن لا نطلب أبداً باسورد إيميلك الشخصي ولا نحفظ باسوردات حسابات الألعاب في موقعنا.</strong></li>
              <li>لا نشارك بياناتك مع أي طرف ثالث. التواصل يتم عبر واتساب فقط.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>6. مسؤوليات العميل</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4 list-disc list-inside space-y-1.5">
              <li>التأكد من مواصفات الحساب قبل الشراء.</li>
              <li>عدم مشاركة بيانات الحساب المشترى مع أي شخص.</li>
              <li>أي محاولة احتيال أو تزوير إثبات دفع تؤدي لحظرك نهائياً.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>7. تعديل الشروط</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-4">
              يحق لنا تعديل هذه الشروط في أي وقت، وسيتم إشعارك بتاريخ التحديث أعلى الصفحة.
            </p>
          </section>

          {/* Footer note */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              للتواصل: واتساب MJ STORE الموجود في الموقع.
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>بضغطك على "موافقة ومتابعة" أنت تقر بأنك قرأت وفهمت كل الشروط أعلاه</span>
            </div>
          </div>

        </article>
      </main>

    </div>
  );
};
