import React from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Wallet, Smartphone } from 'lucide-react';

export const PaymentMethodsSection: React.FC = () => {
  const methods = [
    {
      name: 'تطبيق بنكك (Bankak)',
      subtitle: 'بنك الخرطوم - الحساب المعتمد',
      badge: 'الخيار الأول ⭐',
      details: 'تحويل فوري برقم الحساب عبر تطبيق بنكك مع إرسال إشعار العملية لتسليم بيانات الحساب خلال 3 دقائق.',
      active: true
    },
    {
      name: 'تطبيق أوكاش (O\'Cash)',
      subtitle: 'بنك أمدرمان الوطني',
      badge: 'فوري ومباشر',
      details: 'إيداع وتحويل فوري عبر محفظة أوكاش بضغطة زر وإرسال الإشعار لتأكيد الشراء فوراً.',
      active: true
    },
    {
      name: 'تطبيق ماي كاشي (MyCashi)',
      subtitle: 'شبكة كاشي الإلكترونية بالسودان',
      badge: 'معتمد 100%',
      details: 'دفع سريع عبر محفظة ماي كاشي أو نقاط كاشي المعتمدة في مختلف مدن ومناطق السودان.',
      active: true
    },
    {
      name: 'تطبيق برافو (Bravo)',
      subtitle: 'خدمات الدفع الإلكتروني الذكية',
      badge: 'سهل وسريع',
      details: 'تحويل لحظي مباشر عبر تطبيق برافو للمدفوعات واستلام فوري لكافة معلومات الحساب ورمز التحقق.',
      active: true
    }
  ];

  return (
    <section id="payment-methods" className="py-16 bg-[#050811] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            وسائل دفع سودانية معتمدة
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            طرق الدفع المتوفرة للشراء في <span className="text-amber-400">MJ STORE</span>
          </h2>
          <p className="text-sm text-slate-400">
            طرق الدفع المتوفرة للشراء محصورة رسمياً في: <strong className="text-amber-300">بنكك، أوكاش، ماي كاشي، برافو فقط</strong> لضمان أعلى سرعة وأمان في التسليم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {methods.map((method, idx) => (
            <div
              key={idx}
              className="bg-[#080d21] border border-slate-800 rounded-2xl p-5 hover:border-amber-400/40 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {method.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{method.name}</h3>
                <span className="text-xs text-blue-300/80 block mb-3 font-medium">{method.subtitle}</span>
                <p className="text-xs text-slate-400 leading-relaxed">{method.details}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مفعل ومعتمد للتسليم الفوري</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
