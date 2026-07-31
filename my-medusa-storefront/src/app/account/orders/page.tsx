import { formatPrice } from "@/lib/medusa-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, Clock, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { getCustomerIdFromCookie } from "@/lib/auth";

// 🔴 تغییر مهم: جلوگیری کامل از کش شدن صفحه
export const dynamic = "force-dynamic";
export const revalidate = 0;

// --- توابع کمکی ---

const calculateTotal = (order: any) => {
    // اولویت با قیمت‌های محاسبه شده است
    if (order.total > 0) return order.total;
    if (order.summary?.total > 0) return order.summary.total;

    // محاسبه دستی (اگر کوانتیتی نبود، ۱ در نظر بگیر)
    if (order.items && order.items.length > 0) {
        return order.items.reduce((acc: number, item: any) => {
            const qty = item.quantity || 1; 
            return acc + (item.unit_price * qty);
        }, 0);
    }
    return 0;
}

const getStatusBadge = (order: any) => {
  // ۱. بررسی کنسلی
  if (order.status === "canceled") {
      return <Badge variant="destructive" className="px-3">لغو شده</Badge>;
  }
  
  // ۲. بررسی ارسال (فقط از روی آرایه Fulfillments)
  const fulfillments = order.fulfillments || [];
  
  // اگر حتی یک ارسال ثبت شده باشد که تاریخ ارسال (shipped_at) داشته باشد
  const hasShipped = fulfillments.some((f: any) => f.shipped_at);
  if (hasShipped) {
      return <Badge className="bg-green-100 text-green-700 border-green-200 px-3 hover:bg-green-200">ارسال شده</Badge>;
  }

  // اگر ارسال ساخته شده ولی هنوز تاریخ ارسال نخورده
  if (fulfillments.length > 0) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 hover:bg-blue-200">آماده‌سازی در انبار</Badge>;
  }

  // ۳. وضعیت پرداخت
  if (order.payment_status === "captured" || order.payment_status === "authorized") {
      return <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200 px-3">تایید شده</Badge>;
  }

  return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 px-3">در انتظار بررسی</Badge>;
};

const getFulfillmentText = (order: any) => {
    const fulfillments = order.fulfillments || [];
    
    // اولویت با آخرین وضعیت ارسال است
    if (fulfillments.length > 0) {
        const last = fulfillments[0]; // آخرین آیتم
        if (last.shipped_at) return "تحویل پست شده";
        if (last.canceled_at) return "لغو ارسال";
        return "بسته‌بندی شده";
    }
    
    // اگر هیچ ارسالی نبود
    return "در حال پردازش";
};

// تابع استخراج کد رهگیری
const getTrackingInfo = (order: any) => {
    const fulfillments = order.fulfillments || [];
    if (fulfillments.length === 0) return null;

    const ful = fulfillments[0];
    return (
        ful.tracking_numbers?.[0] || 
        ful.data?.tracking_number || 
        ful.labels?.[0]?.tracking_number || 
        ful.labels?.[0]?.label_url || 
        null
    );
};

export default async function OrdersPage() {
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  const customerId = await getCustomerIdFromCookie();

  let orders = [];

  if (customerId) {
    try {
      // اضافه کردن تایم‌استمپ برای دور زدن کش سرور
      const res = await fetch(`${BASE_URL}/store/custom-orders?t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId,
        },
        cache: "no-store", 
        next: { revalidate: 0 } // اطمینان مضاعف در نکست ۱۶
      });
      
      if (res.ok) {
        const data = await res.json();
        orders = data.orders || [];

        // 🟢 تغییر جدید: مرتب‌سازی نزولی (جدیدترین بالا)
        orders.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      }
    } catch (e) {
      console.error("Orders Error:", e);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">تاریخچه سفارشات</h1>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border">
            {orders.length} سفارش
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">هنوز سفارشی ثبت نکرده‌اید</h3>
            <Link href="/store" className="mt-4">
                <Button>خرید کنید</Button>
            </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any) => {
            const finalTotal = calculateTotal(order);
            const trackingCode = getTrackingInfo(order);

            return (
              <Card key={order.id} className="overflow-hidden border shadow-sm group">
                <CardHeader className="bg-gray-50/60 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-800">#{order.display_id}</span>
                            {getStatusBadge(order)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                            <span className="text-gray-300">|</span>
                            <span><b className="text-green-700 text-sm font-bold">{formatPrice(finalTotal, order.currency_code)}</b></span>
                        </div>
                    </div>
                    
                    <Link href={`/account/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 text-xs h-9">
                            جزئیات سفارش <ChevronLeft className="w-3 h-3"/>
                        </Button>
                    </Link>
                </CardHeader>

                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        {/* آیتم‌ها */}
                        <div className="flex -space-x-3 space-x-reverse overflow-hidden py-1 px-2">
                             {order.items?.slice(0, 4).map((item: any) => (
                                    <div key={item.id} className="relative w-12 h-12 rounded-full border-2 border-white shadow-sm bg-gray-100 shrink-0 overflow-hidden" title={item.title}>
                                        {/* اینجا تغییر جزئی دادیم تا اگر تامنیل نبود ارور ندهد */}
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt="product" className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">تصویر</div>
                                        )}
                                    </div>
                             ))}
                        </div>

                        {/* اطلاعات ارسال */}
                        <div className="w-full md:w-auto min-w-[200px] flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm p-3 rounded-lg border bg-gray-50 border-gray-100">
                                <span className="text-gray-500 flex items-center gap-2"><Truck className="w-4 h-4"/> وضعیت:</span>
                                <span className="font-bold text-gray-800">
                                    {getFulfillmentText(order)}
                                </span>
                            </div>

                            {/* کد رهگیری */}
                            {trackingCode && (
                                <div className="text-xs text-center text-gray-600 bg-blue-50 py-2 rounded border border-blue-100 border-dashed select-all flex justify-between px-3 items-center">
                                    <span>کد رهگیری:</span>
                                    <span className="font-mono font-bold tracking-wider">{trackingCode}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}