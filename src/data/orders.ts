import { CustomerOrder } from '../types';

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ORD-7821',
    accountId: 'mj-ef-01',
    accountTitle: 'حساب ملكي أساطير إبيك - ديفيجن 1 خارق',
    accountPriceSDG: 150000,
    teamStrength: 3165,
    platform: 'mobile',
    customerName: 'طارق عبد المحمود',
    customerPhone: '0912445890',
    paymentMethod: 'تطبيق بنكك (بنك الخرطوم)',
    status: 'completed',
    createdAt: '2026-10-01T14:32:00.000Z',
    transactionRef: 'BNK-9812401',
    notes: 'تم تسليم بريد كونامي الأساسي وتغيير كلمة السر والتأكيد مع العميل.'
  },
  {
    id: 'ORD-7822',
    accountId: 'mj-ef-03',
    accountTitle: 'حساب هجومي خارق - ثنائية الدون والبرغوث',
    accountPriceSDG: 85000,
    teamStrength: 3135,
    platform: 'mobile',
    customerName: 'مصعب إبراهيم عثمان',
    customerPhone: '0922871143',
    paymentMethod: 'تطبيق أوكاش (O\'Cash)',
    status: 'processing',
    createdAt: '2026-10-02T09:15:00.000Z',
    transactionRef: 'OCS-9812994',
    notes: 'تم استلام الإشعار عبر أوكاش، جاري إرسال كود التحقق للعميل.'
  },
  {
    id: 'ORD-7823',
    accountId: 'mj-ef-02',
    accountTitle: 'حساب بوستر كونسول بلايستيشن وPC نخبوي',
    accountPriceSDG: 115000,
    teamStrength: 3150,
    platform: 'console',
    customerName: 'أحمد كمال الدين',
    customerPhone: '0901123490',
    paymentMethod: 'تطبيق ماي كاشي (MyCashi)',
    status: 'completed',
    createdAt: '2026-10-02T10:45:00.000Z',
    transactionRef: 'CSH-829104A7',
    notes: 'تم استلام الدفعة عبر ماي كاشي وتحويل الحساب والإيميل بنجاح.'
  },
  {
    id: 'ORD-7824',
    accountId: 'mj-ef-05',
    accountTitle: 'حساب تكتيكي اقتصادي - أساطير الجيل الذهبي',
    accountPriceSDG: 35000,
    teamStrength: 3110,
    platform: 'mobile',
    customerName: 'عمر خالد بشير',
    customerPhone: '0966453120',
    paymentMethod: 'تطبيق برافو (Bravo)',
    status: 'pending',
    createdAt: '2026-10-02T12:10:00.000Z',
    notes: 'بانتظار إرسال إشعار تحويل تطبيق برافو على الواتساب.'
  }
];
