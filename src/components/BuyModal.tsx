import React, { useState } from 'react';
import { EFootballAccount, UserProfile, CustomerOrder } from '../types';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { X, ShieldCheck, CheckCircle2, Copy, Send, MessageCircle, CreditCard, Sparkles } from 'lucide-react';

interface BuyModalProps {
  account: EFootballAccount | null;
  user: UserProfile | null;
  onOrderCreated?: (order: CustomerOrder) => void;
  onClose: () => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({ account, user, onOrderCreated, onClose }) => {
  const [buyerName, setBuyerName] = useState(user?.displayName || '');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bankak' | 'ocash' | 'mycashi' | 'bravo'>('bankak');
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');

  if (!account) return null;

  const defaultAdminWhatsApp = '249916952608'; // Official WhatsApp number: +249 91 695 2608

  const paymentMethodLabels = {
    bankak: 'تطبيق بنكك (Bankak)',
    ocash: 'تطبيق أوكاش (O\'Cash)',
    mycashi: 'تطبيق ماي كاشي (MyCashi)',
    bravo: 'تطبيق برافو (Bravo)'
  };

  const generateWhatsAppMessage = () => {
    const text = `مرحباً متجر GUNNERS STORE 👋
أرغب في شراء حساب eFootball 2026 التالي:
📌 الحساب: ${account.title}
🔢 كود الحساب: ${account.id}
⚡ قوة الفريق: ${account.teamStrength} | ${account.platformLabel}
💰 السعر: ${account.priceSDG.toLocaleString()} SDG
💳 طريقة الدفع المفضلة: ${paymentMethodLabels[paymentMethod]}
👤 اسم المشتري: ${buyerName || 'عميل المتجر'}
📱 رقم الهاتف: ${buyerPhone || 'عبر هذا الشات'}

يرجى تزويدي ببيانات الدفع والتسليم الفوري. شكراً!`;
    return text;
  };

  const handleSendToWhatsApp = async () => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderId(orderId);

    const orderData: CustomerOrder = {
      id: orderId,
      accountId: account.id,
      accountTitle: account.title,
      accountPriceSDG: account.priceSDG,
      teamStrength: account.teamStrength,
      platform: account.platform || 'موبايل',
      customerName: buyerName || (user?.displayName || 'عميل المتجر'),
      customerPhone: buyerPhone || 'عبر الواتساب',
      paymentMethod: paymentMethodLabels[paymentMethod],
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: 'تم تسجيل الطلب وتوجيه العميل إلى الواتساب للتسليم'
    };

    if (onOrderCreated) {
      onOrderCreated(orderData);
    }

    // Save to Firestore 'orders' collection
    try {
      await addDoc(collection(db, 'orders'), {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        accountTitle: orderData.accountTitle,
        accountId: orderData.accountId,
        price: orderData.accountPriceSDG,
        paymentMethod: orderData.paymentMethod,
        status: 'معلق',
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore addDoc order note:', err);
    }

    const msg = encodeURIComponent(generateWhatsAppMessage());
    const waUrl = `https://wa.me/${defaultAdminWhatsApp}?text=${msg}`;
    window.open(waUrl, '_blank');
    setIsSuccess(true);
  };

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-[#0b1228] border border-amber-500/40 rounded-2xl shadow-2xl shadow-black p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">طلب شراء حساب فوري</span>
            </div>

            <h3 className="text-xl font-black text-white mb-4">
              إتمام طلب شراء الحساب
            </h3>

            {/* Selected Account Summary */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center gap-3">
              <img
                src={account.image}
                alt={account.title}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{account.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  {account.teamStrength && (
                    <>
                      <span className="text-amber-400 font-mono font-bold">قوة {account.teamStrength}</span>
                      <span aria-hidden="true">·</span>
                    </>
                  )}
                  <span>{account.platform || 'موبايل'}</span>
                </div>
                <div className="text-sm font-black text-amber-400 font-mono mt-1">
                  {account.priceSDG.toLocaleString()} SDG
                </div>
              </div>
            </div>

            {/* Buyer Form */}
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  اسمك الكريم
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  رقم الهاتف أو الواتساب للتواصل
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="مثال: 0912345678"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono text-right"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  طريقة الدفع المناسبة لك:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(paymentMethodLabels) as Array<keyof typeof paymentMethodLabels>).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-right transition-colors ${
                        paymentMethod === key
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {paymentMethodLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Guarantee Statement */}
            <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-3 mb-6 flex items-center gap-2.5 text-xs text-blue-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>تسليم فوري لكامل بيانات Konami ID والبريد الأساسي خلال 5 دقائق بعد التحويل مع ضمان الاسترجاع.</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleSendToWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إتمام الطلب عبر WhatsApp مباشرة</span>
              </button>

              <button
                onClick={handleCopyOrder}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">تم نسخ تفاصيل الطلب بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>نسخ تفاصيل الطلب لإرسالها يدوياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Post-Order Confirmation State */
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              تم تحويلك إلى خدمة العملاء بنجاح!
            </h3>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-sm mx-auto">
              سيقوم فريق مبيعات GUNNERS STORE بالرد عليك فوراً على الواتساب وتزويدك برقم حساب بنكك وإتمام نقل الحساب لك بأمان.
            </p>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-400 mb-6 space-y-1 text-right">
              <div><strong className="text-white">رقم الطلب:</strong> #{account.id}-{Math.floor(1000 + Math.random() * 9000)}</div>
              <div><strong className="text-white">الحساب:</strong> {account.title}</div>
              <div><strong className="text-white">المبلغ المطلوب:</strong> {account.priceSDG.toLocaleString()} SDG</div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              العودة إلى المتجر
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
