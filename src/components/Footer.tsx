import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#040712] border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-slate-800/80">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-blue-900 flex items-center justify-center font-black text-slate-950 text-sm">
                MJ
              </div>
              <span className="text-lg font-black text-white">MJ STORE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              المتجر السوداني الأول المتخصص في بيع وشراء أقوى حسابات eFootball 2026 بضمان رسمي وتسليم فوري ومباشر.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>تسجيل رسمي وموثوقية عالية</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#accounts" className="hover:text-amber-400 transition-colors">الحسابات المتاحة</a>
              </li>
              <li>
                <a href="#why-trust" className="hover:text-amber-400 transition-colors">ضمان استرجاع الأموال</a>
              </li>
              <li>
                <a href="#payment-methods" className="hover:text-amber-400 transition-colors">طرق الدفع (بنكك، أوكاش، ماي كاشي، برافو)</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-400 transition-colors">الأسئلة الشائعة حول كونامي</a>
              </li>
            </ul>
          </div>

          {/* Supported Platforms & Games */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">الأنظمة المدعومة</h4>
            <ul className="space-y-2">
              <li>eFootball 2026 Mobile (Android / iOS)</li>
              <li>eFootball 2026 Console (PlayStation 4 / 5)</li>
              <li>eFootball 2026 PC (Steam)</li>
              <li>شحن كوينز وحزم إبيك عند الطلب</li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">طلب الحسابات والدعم الفني</h4>
            <p className="text-xs text-slate-400 mb-3">
              فريق المبيعات متواجد يومياً على مدار 24 ساعة لاستقبال طلباتكم واستفساراتكم.
            </p>
            <a
              href="https://wa.me/249916952608"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors text-xs font-semibold dir-ltr"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>واتساب لطلب الحسابات: +249916952608</span>
            </a>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} <strong className="text-slate-300">MJ STORE</strong>. لعبة eFootball وشعاراتها علامات تجارية تابعة لشركة Konami Digital Entertainment.
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>صُمم بأعلى معايير الجودة للاعبي السودان والعالم العربي</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
