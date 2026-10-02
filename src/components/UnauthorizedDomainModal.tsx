import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { UserProfile } from '../types';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewLogin: (profile: UserProfile) => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onPreviewLogin
}) => {
  const [copied, setCopied] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (!isOpen) return null;

  const handleCopyHost = () => {
    navigator.clipboard.writeText(currentHost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDemoSignIn = () => {
    const demoProfile: UserProfile = {
      uid: 'user-google-preview',
      displayName: 'كابتن eFootball (عميل معتمد)',
      email: 'kanyky995@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };
    onPreviewLogin(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-[#0a0f24] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black p-6 sm:p-7 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              إضافة رابط المعاينة إلى Firebase
            </h3>
            <span className="text-xs text-amber-300 font-mono">
              Firebase: auth/unauthorized-domain
            </span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
          يتطلب تسجيل الدخول عبر Google إضافة نطاق بيئة المعاينة الحالية إلى قائمة النطاقات المصرح بها (<strong className="text-amber-300">Authorized domains</strong>) في كونسول فايربيس لحماية حسابات المستخدمين.
        </p>

        {/* Current Domain Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block mb-0.5">النطاق الحالي المراد إضافته:</span>
            <code className="text-xs font-mono text-amber-400 truncate block dir-ltr text-left">
              {currentHost}
            </code>
          </div>
          <button
            onClick={handleCopyHost}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>

        {/* Fast Steps */}
        <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 mb-5 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-white mb-1">خطوات الإضافة في ثوانٍ (مشروع mjj-store):</p>
          <div className="flex items-start gap-2">
            <span className="font-mono text-amber-400 font-bold">1.</span>
            <span>افتح كونسول فايربيس واذهب إلى <strong>Authentication</strong> ثم تبويب <strong>Settings</strong>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-amber-400 font-bold">2.</span>
            <span>اختر <strong>Authorized domains</strong> واضغط <strong>Add domain</strong>.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-amber-400 font-bold">3.</span>
            <span>الصق النطاق المنسوخ أعلاه واضغط حفظ.</span>
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-3 mb-6 text-xs text-blue-200">
          💡 <strong>ملاحظة هامة:</strong> عند رفع الموقع النهائي على استضافة <strong>Firebase Hosting</strong> (mjj-store.web.app أو mjj-store.firebaseapp.com)، يعمل تسجيل الدخول بجوجل تلقائياً وبشكل مباشر 100% دون أي إعداد يدوي لأن نطاق الاستضافة مصرح به افتراضياً.
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDemoSignIn}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>تجربة تسجيل الدخول الفوري في بيئة المعاينة الآن</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
