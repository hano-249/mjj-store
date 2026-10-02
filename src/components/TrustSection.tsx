import React from 'react';
import { Zap, Headphones, Lock } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustPillars = [
    {
      icon: Zap,
      title: 'تسليم فوري ومباشر',
      description: 'بمجرد تأكيد عملية التحويل، يتم إرسال إيميل وكلمة سر حساب Konami ID وربطه برقم هاتفك فورياً خلال 5 إلى 10 دقائق فقط دون أي تأخير.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10 border-amber-400/20'
    },
    {
      icon: Headphones,
      title: 'دعم فني واتساب 24 ساعة',
      description: 'فريق متخصص في لعبة eFootball 2026 متواجد دائماً لمساعدتك في تغيير البريد وتأمين الحساب وتقديم نصائح تطوير التشكيلة وتوزيع نقاط المهارة.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10 border-blue-400/20'
    },
    {
      icon: Lock,
      title: 'ملكية تامة وإيميل أساسي',
      description: 'لا نبيع حسابات مسروقة أو مشتركة إطلاقاً. أنت المالك الوحيد للحساب مع صلاحية تغيير كافة الروابط بما فيها حساب جوجل بلاي أو أبل آيدي.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10 border-purple-400/20'
    }
  ];

  const transferSteps = [
    { step: '01', title: 'اختر حسابك المفضل', desc: 'تصفح تشكيلات الأساطير وقوة الفريق واختر الحساب المناسب لميزانيتك.' },
    { step: '02', title: 'تواصل وأرسل الإشعار', desc: 'اضغط اشتري الآن وحوّل القيمة عبر بنكك، أوكاش، ماي كاشي، أو برافو.' },
    { step: '03', title: 'استلم بيانات كونامي', desc: 'يصلك البريد الأصلي ورمز التحقق لتسجيل الدخول مباشرة على جهازك.' },
    { step: '04', title: 'غيّر بياناتك والعب!', desc: 'قم بتغيير كلمة المرور وتفعيل التحقق بخطوتين واستمتع باللعب فوراً.' },
  ];

  return (
    <section id="why-trust" className="py-16 sm:py-20 bg-[#070c1d] border-t border-b border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            الأمان والمصداقية أولاً
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4">
            لماذا يثق بنا آلاف لاعبي <span className="text-amber-400">eFootball</span>؟
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            نحن نضع سمعتنا وأمان العميل في المقام الأول. تجربة شراء خالية من المخاطر مع دعم مستمر حتى التأكد من تشغيل الحساب بنجاح.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {trustPillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#0a1026] border border-slate-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${item.bgColor}`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* How Transfer Works (Natural Editorial Steps) */}
        <div className="bg-[#0b132f]/60 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="text-xl font-bold text-white mb-1">
              كيف تتم عملية استلام الحساب خلال 5 دقائق؟
            </h3>
            <p className="text-xs text-slate-400">
              خطوات سريعة وبسيطة تضمن حصولك على حسابك بأعلى درجات الأمان
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {transferSteps.map((stepItem, idx) => (
              <div key={idx} className="relative p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <span className="text-2xl font-black text-amber-400/80 font-mono mb-2">
                  {stepItem.step}
                </span>
                <h4 className="text-sm font-bold text-white mb-1">{stepItem.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
