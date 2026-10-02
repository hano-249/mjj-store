export type PlatformType = 'mobile' | 'console' | 'all';

export interface EFootballAccount {
  id: string;
  title: string;
  subtitle: string;
  priceSDG: number;
  teamStrength: number; // e.g. 3155
  boosterCount: number; // e.g. 14
  messiCount: number; // e.g. 2
  ronaldoCount: number; // e.g. 1
  coins: number; // e.g. 3500
  gpPoints: string; // e.g. "4.8M"
  platform: 'mobile' | 'console';
  platformLabel: string; // e.g. "موبايل (Android / iOS)"
  image: string;
  featuredBadge?: string; // e.g. "الأكثر طلباً" or "تشكيلة أساطير"
  division: string; // e.g. "ديفيجن 1 (Division 1)"
  manager: string; // e.g. "بيب غوارديولا (Boost 88)" or "يورغن كلوب"
  formation: string; // e.g. "4-2-1-3"
  topPlayers: string[]; // key epic / showtime players
  description: string;
  konamiStatus: string; // e.g. "إيميل أساسي متاح للتغيير الكامل"
  guaranteeDays: number; // e.g. 30
}

export type PriceRangeType = 'all' | 'under-50k' | '50k-150k' | 'above-150k';

export interface FilterState {
  searchQuery: string;
  platform: PlatformType;
  priceRange: PriceRangeType;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface CustomerOrder {
  id: string;
  accountId: string;
  accountTitle: string;
  accountPriceSDG: number;
  teamStrength: number;
  platform: 'mobile' | 'console';
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  transactionRef?: string;
  notes?: string;
}
