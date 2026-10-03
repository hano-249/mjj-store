import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'هل الحسابات آمنة ومحمية من الباند أو الإغلاق في eFootball 2026؟',
      a: 'نعم 100%، جميع الحسابات المعروضة في GUNNERS STORE لعب حقيقي ونظيف بدون أي برامج خارجية أو تهكير، وتم فحص سجل المباريات والعمليات عليها قبل طرحها للبيع مع ضمان أمان كامل.'
    },
    {
      q: 'كيف أضمن عدم استرجاع الحساب من المالك القديم؟',
      a: 'الحسابات التي نبيعها مسجلة بإيميلات أساسية غير مربوطة بأي حسابات شخصية، وعند الشراء يتم نقل الحساب لك بشكل كامل مع تغيير البريد وكلمة المرور وتفعيل ميزة التحقق بخطوتين برقم هاتفك الخاص، فتكون أنت المالك الشرعي والوحيد.'
    },
    {
      q: 'هل يمكنني لعب الحساب على هواتف الأندرويد والآيفون معاً؟',
      a: 'نعم، حسابات الموبايل يمكن تشغيلها على أي جهاز أندرويد أو آيفون (iOS) عبر تسجيل الدخول ببيانات Konami ID الخاصة بالحساب بكل سلاسة.'
    },
    {
      q: 'ماذا أفعل بعد إتمام التحويل عبر تطبيق بنكك، أوكاش، ماي كاشي، أو برافو؟',
      a: 'بعد التحويل عبر أي من الطرق المعتمدة (بنكك، أوكاش، ماي كاشي، برافو)، قم بالضغط على زر إتمام الطلب عبر WhatsApp وأرسل إشعار التحويل. سيتولى المسؤول المباشر إرسال الإيميل وكلمة المرور وتوجيهك خطوة بخطوة حتى تفتح الحساب وتتأكد من تشكيلتك.'
    },
    {
      q: 'هل يمكنكم توفير حساب بمواصفات خاصة أو ميزانية محددة؟',
      a: 'بالتأكيد، يمكنك التواصل معنا مباشرة عبر زر الواتساب العائم وطلب المواصفات التي تبحث عنها (مثل بطاقة معينة أو ميزانية معينة) وسنوفر لك أفضل الخيارات المتاحة في نفس اليوم.'
    }
  ];

  return (
    <section id="faq" className="py-16 bg-[#070b1a] border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            كل ما يدور في ذهنك
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            الأسئلة الشائعة حول شراء الحسابات
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            إجابات واضحة وشفافة لضمان راحة بالك قبل الشراء
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#0b122b] border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
