import React, { useState } from 'react';
import { ShieldCheck, X, ExternalLink, FileText, Check } from 'lucide-react';

interface TermsConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgreeAndContinue: () => void;
  onNavigateToTerms: () => void;
  onNavigateToPrivacy: () => void;
  isSigningIn?: boolean;
}

export const TermsConsentModal: React.FC<TermsConsentModalProps> = ({
  isOpen,
  onClose,
  onAgreeAndContinue,
  onNavigateToTerms,
  onNavigateToPrivacy,
  isSigningIn = false
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-[#0a0f24] border border-amber-500/40 rounded-3xl shadow-2xl shadow-black p-6 sm:p-7 text-right animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">
              سياسة الاستخدام والخصوصية
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              متجر GUNNERS STORE المعتمد
            </span>
          </div>
        </div>

        {/* Short Text */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-3.5 rounded-2xl mb-4">
          بمتابعتك، أنت توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بـ <strong className="text-white">GUNNERS STORE</strong>. نحن نحمي بياناتك ولا نشاركها.
        </p>

        {/* Links to Full Policies */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold mb-5 pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToTerms();
            }}
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline transition-colors py-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>[شروط الاستخدام]</span>
          </button>

          <span className="text-slate-600">|</span>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToPrivacy();
            }}
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline transition-colors py-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>[سياسة الخصوصية]</span>
          </button>
        </div>

        {/* Checkbox */}
        <div className="mb-6">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-amber-400 peer-checked:bg-amber-400 transition-all flex items-center justify-center bg-slate-950">
                {agreed && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-relaxed">
              أوافق على شروط الاستخدام وسياسة الخصوصية
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors border border-slate-800"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={!agreed || isSigningIn}
            onClick={onAgreeAndContinue}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{isSigningIn ? 'جارٍ المتابعة...' : 'موافقة ومتابعة'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
