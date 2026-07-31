import { formatPrice } from "@/lib/medusa-client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Package, MapPin, CreditCard, ChevronRight, 
  Truck, Calendar, User, Phone
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { getCustomerIdFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

// --- توابع کمکی ---
const getSmartStatusBadge = (order: any) => {
    if (order.status === "canceled") {
        return <Badge variant="destructive" className="px-3 py-1">لغو شده</Badge>;
    }
    
    const fulfillments = order.fulfillments || [];
    // آیا تاریخ ارسال دارد؟
    const isShipped = fulfillments.some((f: any) => f.shipped_at);

    if (isShipped) {
        return <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">ارسال شده</Badge>;
    }
    if (fulfillments.length > 0) {
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">بسته‌بندی شده</Badge>;
    }
    if (order.payment_status === 'captured') {
        return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">تایید شده</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-100 text-gray-600 px-3 py-1">در انتظار بررسی</Badge>;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  // دریافت شناسه مشتری برای احراز هویت در API اختصاصی
  const customerId = await getCustomerIdFromCookie();

  let order = null;

  if (customerId) {
      try {
        // 🪄 استفاده از API اختصاصی با فیلتر ID
        const res = await fetch(`${BASE_URL}/store/custom-orders?id=${id}&t=${Date.now()}`, {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": PUBLISHABLE_KEY,
            "x-customer-id": customerId,
          },
          cache: "no-store",
        });
        
        if (res.ok) {
          const data = await res.json();
          // چون API آرایه برمی‌گرداند، اولین آیتم را می‌گیریم
          if (data.orders && data.orders.length > 0) {
              order = data.orders[0];
          }
        }
      } catch (e) {
        console.error("Order Detail Error:", e);
      }
  }

  if (!order) return notFound();

  // 🕵️‍♂️ استخراج کد رهگیری
  let trackingNumber = null;
  if (order.fulfillments && order.fulfillments.length > 0) {
      const lastFul = order.fulfillments[0];
      trackingNumber = 
        lastFul.tracking_numbers?.[0] || 
        lastFul.labels?.[0]?.tracking_number || 
        lastFul.data?.tracking_number || 
        null;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/account/orders">
            <Button variant="ghost" size="icon"><ChevronRight className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">جزئیات سفارش #{order.display_id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="bg-gray-50 border-b py-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">وضعیت سفارش:</span>
                        {getSmartStatusBadge(order)}
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            تاریخ ثبت: <span className="font-bold">{new Date(order.created_at).toLocaleString('fa-IR')}</span>
                        </div>

                        {trackingNumber ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600"><Truck className="w-6 h-6"/></div>
                                    <div>
                                        <p className="text-green-800 font-bold text-sm">سفارش ارسال شده است</p>
                                        <p className="text-green-600 text-xs mt-1">کد رهگیری: <span className="font-mono font-bold text-base select-all">{trackingNumber}</span></p>
                                    </div>
                                </div>
                                <a href={`https://tracking.post.ir/?id=${trackingNumber}`} target="_blank" className="w-full sm:w-auto">
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                                        پیگیری از سامانه پست
                                    </Button>
                                </a>
                            </div>
                        ) : (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 text-blue-700 text-sm mt-2">
                                <Package className="w-5 h-5"/>
                                <span>سفارش شما تایید شده و به زودی وارد مرحله بسته‌بندی می‌شود.</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">اقلام سفارش</CardTitle></CardHeader>
                <CardContent className="divide-y">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="py-4 flex gap-4 items-center">
                            <div className="relative w-20 h-20 bg-gray-100 rounded-lg border overflow-hidden shrink-0">
                                {item.thumbnail && <Image src={item.thumbnail} alt="" fill className="object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0 text-sm">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">تعداد: {item.quantity || 1} عدد</p>
                            </div>
                            <div className="text-left font-bold text-sm">
                                {formatPrice(item.unit_price * (item.quantity || 1), order.currency_code)}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base">خلاصه مالی</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                    {/* محاسبه سابتوتال اگر صفر بود */}
                    <div className="flex justify-between">
                        <span>مجموع اقلام</span>
                        <span>{formatPrice(order.subtotal || order.total, order.currency_code)}</span>
                    </div>
                    {/* اگر هزینه ارسال صفر بود نشان نده یا رایگان بزن */}
                    <div className="flex justify-between">
                        <span>هزینه ارسال</span>
                        <span>{order.shipping_total > 0 ? formatPrice(order.shipping_total, order.currency_code) : "رایگان"}</span>
                    </div>
                    <Separator/>
                    <div className="flex justify-between font-bold text-lg text-green-700">
                        <span>مبلغ کل</span>
                        <span>{formatPrice(order.total, order.currency_code)}</span>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-3 border-t text-xs flex gap-2 items-center">
                    <CreditCard className="w-4 h-4 text-gray-400"/>
                    وضعیت: <span className="font-bold">{order.payment_status === 'captured' ? 'پرداخت موفق' : 'در انتظار پرداخت'}</span>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader><CardTitle className="text-base">آدرس گیرنده</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-3">
                    <div className="flex gap-2"><User className="w-4 h-4 text-gray-400"/> {order.shipping_address?.first_name} {order.shipping_address?.last_name}</div>
                    <div className="flex gap-2"><Phone className="w-4 h-4 text-gray-400"/> <span className="dir-ltr">{order.shipping_address?.phone}</span></div>
                    <div className="flex gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0"/>
                        <span className="leading-6">{order.shipping_address?.province}، {order.shipping_address?.city}، {order.shipping_address?.address_1}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}