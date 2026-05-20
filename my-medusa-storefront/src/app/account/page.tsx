import { cookies } from "next/headers";
import { formatPrice } from "@/lib/medusa-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, CreditCard, ChevronLeft, ShoppingBag, 
  TrendingUp, Clock, Truck 
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// --- توابع کمکی (برای محاسبه قیمت و وضعیت) ---

const calculateOrderTotal = (order: any) => {
    if (order.total > 0) return order.total;
    if (order.summary?.total > 0) return order.summary.total;
    if (order.items && order.items.length > 0) {
        return order.items.reduce((acc: number, item: any) => {
            const qty = item.quantity || 1; 
            return acc + (item.unit_price * qty);
        }, 0);
    }
    return 0;
};

const getStatusBadge = (order: any) => {
    const fulfillments = order.fulfillments || [];
    const isShipped = fulfillments.some((f: any) => f.shipped_at);

    if (order.status === "canceled") return <Badge variant="destructive" className="px-2 py-0.5 text-[10px]">لغو شده</Badge>;
    if (isShipped) return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-2 py-0.5 text-[10px]">ارسال شده</Badge>;
    if (fulfillments.length > 0) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-2 py-0.5 text-[10px]">بسته‌بندی شده</Badge>;
    if (order.payment_status === 'captured') return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 px-2 py-0.5 text-[10px]">تایید شده</Badge>;
    
    return <Badge variant="outline" className="text-[10px]">در انتظار بررسی</Badge>;
};

export default async function AccountOverview() {
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  // دریافت کوکی‌ها برای احراز هویت
  const cookieStore = await cookies();
  const customerId = cookieStore.get("_medusa_jwt")?.value;

  let allOrders: any[] = [];
  let totalSpent = 0;
  let recentOrders: any[] = [];

  if (customerId) {
    try {
      // 🪄 استفاده از API اختصاصی که ساختیم
      const res = await fetch(`${BASE_URL}/store/custom-orders?t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        allOrders = data.orders || [];
        
        // محاسبه مجموع خرید کل دوران
        totalSpent = allOrders.reduce((acc, order) => acc + calculateOrderTotal(order), 0);
        
        // جدا کردن ۳ سفارش آخر
        recentOrders = allOrders.slice(0, 3);
      }
    } catch (e) {
      console.error("Overview Fetch Error:", e);
    }
  }

  // واحد پول (از اولین سفارش یا پیش‌فرض)
  const currencyCode = allOrders[0]?.currency_code || "irr";

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* هدر */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-gray-400"/>
            پیشخوان حساب کاربری
        </h1>
        <p className="text-gray-500 text-sm mt-2">خلاصه وضعیت سفارشات و حساب شما</p>
      </div>

      {/* کارت‌های آمار سریع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* کارت تعداد سفارش */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Package className="w-6 h-6" />
            </div>
            <div>
                <span className="block text-2xl font-bold text-gray-900">{allOrders.length}</span>
                <span className="text-xs text-gray-500">کل سفارش‌ها</span>
            </div>
        </div>

        {/* کارت مجموع خرید */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <CreditCard className="w-6 h-6" />
            </div>
            <div>
                <span className="block text-xl font-bold text-gray-900">{formatPrice(totalSpent, currencyCode)}</span>
                <span className="text-xs text-gray-500">مجموع خرید شما</span>
            </div>
        </div>
        
        {/* کارت وضعیت آخرین سفارش */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <span className="block text-sm font-bold text-gray-900">
                    {recentOrders.length > 0 ? "فعال و مشتری وفادار" : "هنوز خریدی نداشته‌اید"}
                </span>
                <span className="text-xs text-gray-500">وضعیت حساب</span>
            </div>
        </div>
      </div>

      {/* لیست آخرین سفارشات */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400"/>
                سفارش‌های اخیر
            </h2>
            <Link href="/account/orders">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs gap-1">
                    مشاهده همه <ChevronLeft className="w-3 h-3" />
                </Button>
            </Link>
        </div>

        {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed text-gray-400">
                <ShoppingBag className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
                <Link href="/store" className="mt-4">
                    <Button variant="outline" size="sm">شروع خرید</Button>
                </Link>
            </div>
        ) : (
            <div className="grid gap-3">
                {recentOrders.map((order: any) => {
                    const total = calculateOrderTotal(order);
                    return (
                        <Link href={`/account/orders/${order.id}`} key={order.id} className="block group">
                            <Card className="hover:border-blue-300 transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 p-2.5 rounded-lg text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Package className="w-5 h-5"/>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                                                سفارش #{order.display_id}
                                            </p>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString('fa-IR')}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-left flex flex-col items-end gap-1">
                                        <span className="font-bold text-sm text-gray-900">{formatPrice(total, order.currency_code)}</span>
                                        {getStatusBadge(order)}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}