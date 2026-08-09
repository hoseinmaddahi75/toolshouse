// src/app/(admin)/dashboard/reports/actions.ts
"use server";

import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { cookies } from "next/headers";

async function getAdminToken() {
  const cookieStore = await cookies();
  return cookieStore.get("_medusa_admin_token")?.value;
}

export async function getOrdersReport(from?: string, to?: string) {
  const token = await getAdminToken();
  if (!token) return { orders: [], count: 0, revenue: 0 };

  try {
    const params = new URLSearchParams({
      limit: "500",
      order: "-created_at",
      fields: "+items,+items.title,+items.product_title,+items.thumbnail,+items.quantity,+items.unit_price,+total,+payment_status,+fulfillment_status,+status,+created_at,+shipping_address.province,+shipping_address.city,+shipping_address.first_name,+shipping_address.last_name,+customer.first_name,+customer.last_name,+customer.email,+discount_total,+promotions,+discounts",    });

    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/orders?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("خطا در دریافت سفارشات");
    const data = await res.json();
    let orders = data.orders || [];

    // فیلتر زمانی سمت سرور (جاوااسکریپت)
    if (from && to) {
      const fromTime = new Date(from).getTime();
      const toTime = new Date(to).getTime();
      
      orders = orders.filter((o: any) => {
        const orderTime = new Date(o.created_at).getTime();
        return orderTime >= fromTime && orderTime <= toTime;
      });
    }

    const activeOrders = orders.filter((o: any) => o.payment_status !== 'canceled');
    const revenue = activeOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    return { 
      orders, 
      count: orders.length, 
      revenue 
    };
  } catch (error) {
    console.error("Reports Order Fetch Error:", error);
    return { orders: [], count: 0, revenue: 0 };
  }
}

export async function getNewCustomersCount(from?: string, to?: string) {
  const token = await getAdminToken();
  if (!token) return 0;

  try {
    const params = new URLSearchParams({ limit: "500" });

    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/customers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      let customers = data.customers || [];

      if (from && to) {
        const fromTime = new Date(from).getTime();
        const toTime = new Date(to).getTime();
        
        customers = customers.filter((c: any) => {
          const createdTime = new Date(c.created_at).getTime();
          return createdTime >= fromTime && createdTime <= toTime;
        });
      }
      return customers.length;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

// 💡 تابع جدید: محاسبه ۱۰ محصول پرفروش و کم‌فروش
export async function getProductSalesData(orders: any[]) {
  const productMap: Record<string, {
    id: string;
    title: string;
    thumbnail?: string;
    totalQuantity: number;
    totalRevenue: number;
  }> = {};

  // تجمیع آیتم‌های سفارشات فعال
  orders
    .filter((o: any) => o.payment_status !== 'canceled')
    .forEach((order: any) => {
      if (!order.items) return;

      order.items.forEach((item: any) => {
        const key = item.product_id || item.title;
        if (!productMap[key]) {
          productMap[key] = {
            id: item.product_id || '',
            title: item.product_title || item.title || 'محصول بدون نام',
            thumbnail: item.thumbnail,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }

        const qty = item.quantity || 1;
        const price = (item.unit_price || 0) * qty;

        productMap[key].totalQuantity += qty;
        productMap[key].totalRevenue += price / 10; // تومان
      });
    });

  const productsList = Object.values(productMap);

  // ۱۰ پرفروش‌ترین (بر اساس تعداد فروش)
  const topProducts = [...productsList]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // ۱۰ کم‌فروش‌ترین (بر اساس تعداد فروش)
  const bottomProducts = [...productsList]
    .sort((a, b) => a.totalQuantity - b.totalQuantity)
    .slice(0, 10);

  return { topProducts, bottomProducts };
}



// 💡 تابع پاکسازی و یکپارچه‌سازی نام استان‌ها
function normalizeProvinceName(rawName?: string): string {
  if (!rawName) return "ثبت نشده";
  
  // ۱. حذف فاصله‌های اضافی و کوچک کردن حروف برای کلمات انگلیسی
  let name = rawName.trim().toLowerCase();

  // ۲. مپینگ (Mapping) کلمات رایج به یک استاندارد مشخص
  if (name.includes("tehran") || name === "تهران") return "تهران";
  
  if (
    name.includes("khorasan razavi") || 
    name === "خراسان رضوی" || 
    name.includes("mashhad") || 
    name === "مشهد"
  ) return "خراسان رضوی";

  if (
    name.includes("khorasan south") || 
    name === "خراسان جنوبی" || 
    name.includes("birjand") || 
    name === "بیرجند"
  ) return "خراسان جنوبی";

  if (name.includes("isfahan") || name.includes("esfahan") || name === "اصفهان") return "اصفهان";
  if (name.includes("fars") || name.includes("shiraz") || name === "فارس" || name === "شیراز") return "فارس";

  // می‌توانی بقیه استان‌های پرفروشت رو هم اینجا اضافه کنی...

  // اگر تو دیکشنری ما نبود، همون اسم اصلی رو (بدون فاصله‌ی اضافه) برمی‌گردونه
  return rawName.trim(); 
}




// 💡 تابع جدید: پردازش آمار مشتریان و استان‌ها
export async function getCustomerAnalytics(orders: any[]) {
  const activeOrders = orders.filter((o: any) => o.payment_status !== 'canceled');

  // ۱. تجمیع بر اساس مشتریان
  const customerMap: Record<string, {
    id: string;
    email: string;
    name: string;
    ordersCount: number;
    totalSpent: number;
  }> = {};

  // ۲. تجمیع بر اساس استان
  const provinceMap: Record<string, {
    province: string;
    ordersCount: number;
    totalSpent: number;
  }> = {};

  activeOrders.forEach((order) => {
    // پردازش مشتری
    const email = order.email || order.customer?.email || "نامشخص";
    const name = order.shipping_address?.first_name 
      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
      : (order.customer?.first_name ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim() : "مهمان");
    const customerId = order.customer_id || order.customer?.id || "";
    
    if (!customerMap[email]) {
      customerMap[email] = { id: customerId, email, name, ordersCount: 0, totalSpent: 0 };
    }
    customerMap[email].ordersCount += 1;
    customerMap[email].totalSpent += (order.total || 0) / 10; // تومان

    // پردازش استان (استفاده از تابع نرمالایزر برای جلوگیری از دوگانگی)
    const rawProvince = order.shipping_address?.province || order.shipping_address?.city;
    const province = normalizeProvinceName(rawProvince);

    if (!provinceMap[province]) {
      provinceMap[province] = { province, ordersCount: 0, totalSpent: 0 };
    }
    provinceMap[province].ordersCount += 1;
    provinceMap[province].totalSpent += (order.total || 0) / 10;
  });

  const customersList = Object.values(customerMap);
  
  // ۱۰ مشتری برتر (VIP)
  const topCustomers = [...customersList]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // نرخ خرید مجدد (مشتریانی که بیشتر از ۱ سفارش دارند)
  const repeatCustomersCount = customersList.filter(c => c.ordersCount > 1).length;
  const repeatRate = customersList.length > 0 
    ? Math.round((repeatCustomersCount / customersList.length) * 100) 
    : 0;

  // لیست استان‌ها مرتب‌شده بر اساس تعداد سفارش
  const provincesList = Object.values(provinceMap)
    .sort((a, b) => b.ordersCount - a.ordersCount);

  return {
    totalActiveCustomers: customersList.length,
    repeatRate,
    topCustomers,
    provincesList,
  };
}


// 💡 تابع جدید: پردازش آمار کدهای تخفیف و کمپین‌ها
export async function getPromotionsAnalytics(orders: any[]) {
  const activeOrders = orders.filter((o: any) => o.payment_status !== 'canceled');

  let totalDiscountAmount = 0;
  let ordersWithDiscount = 0;
  let revenueWithDiscount = 0;
  let revenueWithoutDiscount = 0;
  let ordersWithoutDiscount = 0;

  const promoMap: Record<string, { id: string; code: string; count: number; totalDiscount: number }> = {};

  activeOrders.forEach(order => {
    // تبدیل مقادیر به تومان
    const discountTotal = (order.discount_total || 0) / 10; 
    const orderTotal = (order.total || 0) / 10;
    
    // در مدوسا کدهای تخفیف ممکنه تو فیلد discounts یا promotions باشن
    const appliedCodes = order.promotions || order.discounts || [];
    const hasDiscount = discountTotal > 0 || appliedCodes.length > 0;

    if (hasDiscount) {
      totalDiscountAmount += discountTotal;
      ordersWithDiscount += 1;
      revenueWithDiscount += orderTotal;

      if (appliedCodes.length > 0) {
        appliedCodes.forEach((promo: any) => {
          const code = promo.code || 'کد نامشخص';
          const promoId = promo.id || '';
          if (!promoMap[code]) promoMap[code] = { id: promoId, code, count: 0, totalDiscount: 0 };
          promoMap[code].count += 1;
          promoMap[code].totalDiscount += discountTotal; 
        });
      } else if (discountTotal > 0) {
        const code = 'تخفیف خودکار';
        if (!promoMap[code]) promoMap[code] = { id: 'auto', code, count: 0, totalDiscount: 0 };
        promoMap[code].count += 1;
        promoMap[code].totalDiscount += discountTotal;
      }
    } else {
      ordersWithoutDiscount += 1;
      revenueWithoutDiscount += orderTotal;
    }
  });

  // محاسبه ارزش سبد خرید (AOV)
  const aovWithDiscount = ordersWithDiscount > 0 ? Math.round(revenueWithDiscount / ordersWithDiscount) : 0;
  const aovWithoutDiscount = ordersWithoutDiscount > 0 ? Math.round(revenueWithoutDiscount / ordersWithoutDiscount) : 0;

  // مرتب‌سازی کدهای تخفیف بر اساس دفعات استفاده
  const topPromotions = Object.values(promoMap).sort((a, b) => b.count - a.count);

  return {
    totalDiscountAmount,
    ordersWithDiscount,
    discountUsageRate: activeOrders.length > 0 ? Math.round((ordersWithDiscount / activeOrders.length) * 100) : 0,
    aovWithDiscount,
    aovWithoutDiscount,
    topPromotions
  };
}



// 💡 تابع جدید: دریافت هشدار موجودی رو به اتمام (Low Stock)
export async function getInventoryAlerts() {
  const token = await getAdminToken();
  if (!token) return [];

  try {
    const params = new URLSearchParams({
      limit: "500",
      // دریافت متغیرها و موجودی هر متغیر
      fields: "+variants,+variants.inventory_quantity,+variants.title,+title,+thumbnail",
    });

    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/products?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // برای موجودی انبار کش نباید داشته باشیم
    });

    if (!res.ok) return [];
    const data = await res.json();
    const products = data.products || [];

    const lowStockItems: any[] = [];

    products.forEach((product: any) => {
      if (!product.variants) return;

      product.variants.forEach((variant: any) => {
        const qty = variant.inventory_quantity || 0;
        
        // اگر موجودی ۵ یا کمتر بود، وارد لیست هشدار می‌شود
        if (qty <= 5) {
          lowStockItems.push({
            id: variant.id,
            productId: product.id,
            productTitle: product.title,
            variantTitle: variant.title,
            thumbnail: product.thumbnail,
            quantity: qty,
          });
        }
      });
    });

    // مرتب‌سازی از کمترین موجودی (آن‌هایی که ۰ یا ۱ هستند در صدر قرار می‌گیرند)
    return lowStockItems.sort((a, b) => a.quantity - b.quantity);
  } catch (error) {
    console.error("Inventory Fetch Error:", error);
    return [];
  }
}