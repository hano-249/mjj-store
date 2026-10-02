import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  onChatClick: () => void;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onChatClick }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
      {/* Tooltip bubble on desktop */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-[#091129]/95 text-white text-xs px-3.5 py-2 rounded-xl border border-emerald-500/40 shadow-xl shadow-black/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>تواصل معنا مباشرة عبر واتساب للمساعدة</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-white p-0.5 mr-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={onChatClick}
        aria-label="تواصل عبر واتساب"
        className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-emerald-300/40"
      >
        <MessageCircle className="w-7 h-7" />
        {/* Pulsing indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#050811] flex items-center justify-center text-[9px] font-black text-slate-950">
          1
        </span>
      </button>
    </div>
  );
};
