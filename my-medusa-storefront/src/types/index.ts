export interface Product {
  id: string;
  title: string;
  subtitle?: string | null; // 🟢 اضافه شده برای جلوگیری از ارورهای تایپ‌اسکریپت در سئو
  handle: string;
  description: string | null;
  thumbnail: string | null;
  categories?: { id: string; name: string; handle: string }[];
  
  // ✅ فیلدهای جدید که اضافه کردیم
  images?: { id: string; url: string }[];
  options?: { id?: string; title: string; values: any[] }[];
  metadata?: Record<string, unknown> | null;

  variants: Variant[];
}

export interface Variant {
  id: string;
  title: string;
  
  // ✅ فیلدهای حیاتی برای موجودی و انتخابگر
  inventory_quantity?: number;
  manage_inventory?: boolean;
  options?: Record<string, string> | any[]; // نگهداری آپشن‌های واریانت (رنگ: قرمز)

  prices: Price[];
}

export interface Price {
  amount: number;
  currency_code: string;
}