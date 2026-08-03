"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ChevronRight, Printer, Truck, Loader2, 
  MapPin, User, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/medusa-client";
import { registerShipmentAction } from "@/app/(admin)/dashboard/orders/actions";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// تایپ‌ها
type Fulfillment = any;
type OrderItem = {
  id: string; title: string; quantity: number; unit_price: number; thumbnail: string; fulfilled_quantity?: number; variant: { product: { title: string } };
};
type OrderDetail = {
  id: string; display_id: number; email: string; currency_code: string; total: number; subtotal: number; tax_total: number; shipping_total: number; created_at: string; status: string; fulfillment_status: string; payment_status: string;
  shipping_address: { first_name: string; last_name: string; address_1: string; city: string; postal_code: string; phone: string; };
  items: OrderItem[]; fulfillments: Fulfillment[];
};

export default function OrderDetailsView({ id, token }: { id: string, token: string }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const BASE_URL = MEDUSA_BACKEND_URL;

  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);

      // 👇 الگوی استخراج شده از پنل رسمی مدوسا
      // رمز موفقیت: استفاده از * برای تمام سطوح تو در تو
      const queryParams = new URLSearchParams({
        fields: [
          "id,status,display_id,created_at,email,currency_code,total,subtotal,shipping_total,tax_total,fulfillment_status,payment_status", // فیلدهای پایه
          "*items",               // تمام فیلدهای آیتم‌ها
          "*shipping_address",    // تمام فیلدهای آدرس
          "*payment_collections", // اطلاعات پرداخت
          "*fulfillments",        // خودِ آبجکت فولفیلمنت
          "*fulfillments.items",  // آیتم‌های داخل بسته
          "*fulfillments.labels"  // 👈 کلید طلایی: تمام فیلدهای لیبل (شامل ترکینگ)
        ].join(",")
      });

      const orderRes = await fetch(`${BASE_URL}/admin/orders/${id}?${queryParams.toString()}`, {
        headers: authHeaders,
        cache: "no-store",
        credentials: "include"
      });

      if (!orderRes.ok) {
          if (orderRes.status === 401) throw new Error("نشست کاربری منقضی شده");
          throw new Error("سفارش یافت نشد");
      }

      const orderData = await orderRes.json();
      
      // لاگ نهایی برای اینکه لذت ببرید
      console.log("✅ Fulfillments:", orderData.order.fulfillments);
      console.log("🎫 Labels:", orderData.order.fulfillments?.[0]?.labels);

      setOrder(orderData.order);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) fetchOrder();
  }, [id, token]);

  const handleFulfillment = async () => {
    if (!order) return;
    if (!confirm("آیا برای بسته‌بندی اقلام باقی‌مانده مطمئن هستید؟")) return;

    setActionLoading(true);
    try {
      const itemsToFulfill = (order.items || [])
        .map((item) => {
           const fulfilled = (item as any).fulfilled_quantity || 0;
           const quantityToFulfill = item.quantity - fulfilled;
           return { id: item.id, quantity: quantityToFulfill };
        })
        .filter((i) => i.quantity > 0);

      if (itemsToFulfill.length === 0) {
        toast.error("آیتمی برای پردازش وجود ندارد.");
        setActionLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/admin/orders/${order.id}/fulfillments`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
            items: itemsToFulfill,
            no_notification: false
        }),
        credentials: "include"
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "خطا در عملیات بسته‌بندی");
      }
      
      toast.success("بسته‌بندی انجام شد.");
      await fetchOrder();

    } catch (error: any) { toast.error(error.message); } finally { setActionLoading(false); }
  };

  const handleCreateShipment = async (fulfillmentId: string) => {
      const tracking = prompt("کد رهگیری پست را وارد کنید:");
      if (!tracking) return;
      if (!order) return;

      setActionLoading(true);
      try {
          // ✅ ساخت FormData برای ارسال به Server Action [cite: 316]
          const formData = new FormData();
          formData.append("orderId", order.id);
          formData.append("fulfillmentId", fulfillmentId);
          formData.append("tracking", tracking);

          const result = await registerShipmentAction(null, formData);

          if (result?.success) {
              toast.success(result.message);
              await fetchOrder(); 
          } else {
              toast.error(result?.message || "خطا در ثبت");
          }
      } catch (error: any) { 
          console.error(error);
          toast.error("خطای غیرمنتظره رخ داد"); 
      } finally { 
          setActionLoading(false); 
      }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-gray-400 w-8 h-8" /></div>;
  if (!order) return <div className="p-8 text-center text-gray-500">سفارش یافت نشد</div>;

  const isShipped = ["shipped", "fulfilled", "partially_shipped"].includes(order.fulfillment_status);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 md:px-8">
      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-8">
        <div className="flex items-center gap-2">
           <Link href="/dashboard/orders"><Button variant="ghost" size="icon"><ChevronRight className="w-5 h-5 text-gray-500" /></Button></Link>
           <div>
             <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">سفارش #{order.display_id} <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
  {order.payment_status === "captured" ? "پرداخت موفق" : order.payment_status}
</span></h1>
             <p className="text-sm text-gray-500 mt-1">{order.email}</p>
           </div>
        </div>
        {/* در بخش هدر صفحه، جایی که دکمه‌ها قرار دارند */}
<div className="flex gap-3">
    
<Link href={`/admin-invoice/${order.id}`} target="_blank">
  <Button variant="outline" className="gap-2 border-gray-300">
    <Printer className="w-4 h-4" /> 
    چاپ فاکتور رسمی
  </Button>
</Link>

    {!isShipped && (
        <Button onClick={handleFulfillment} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />} بسته‌بندی
        </Button>
    )}
</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {/* لیست اقلام */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-2"><Package className="w-4 h-4 text-gray-500" /><h3 className="font-bold text-gray-800">اقلام سفارش</h3></div>
                  <div className="divide-y">
                      {order.items.map((item) => (
                          <div key={item.id} className="p-4 flex gap-4 items-center">
                              <div className="relative w-16 h-16 bg-gray-100 rounded-lg border overflow-hidden shrink-0">
                                  {item.thumbnail && <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized/>}
                              </div>
                              <div className="flex-1"><h4 className="font-medium text-gray-900">{item.title}</h4><p className="text-xs text-gray-500">x {item.quantity}</p></div>
                              <div className="font-bold">{formatPrice(item.unit_price * item.quantity, order.currency_code)}</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* وضعیت ارسال */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b bg-blue-50 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600" /><h3 className="font-bold text-blue-800">وضعیت ارسال</h3></div>
                  <div className="p-6">
                    {(!order.fulfillments || order.fulfillments.length === 0) ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed"><p className="text-gray-500">هنوز بسته‌ای آماده نشده است.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {order.fulfillments.map((fulfillment) => {
                                // ✅ نمایش کد رهگیری بر اساس ساختار جدید V2 (labels)
                                const trackingCode = fulfillment.labels?.[0]?.tracking_number || null;
                                
                                return (
                                <div key={fulfillment.id} className="border p-4 rounded-xl bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all hover:border-blue-200">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs bg-white border px-2 py-1 rounded text-gray-500">#{fulfillment.id.slice(0, 8)}</span>
                                            <span className="text-xs text-gray-400">{new Date(fulfillment.created_at).toLocaleDateString('fa-IR')}</span>
                                        </div>
                                        <div className="mt-1">
                                            {fulfillment.shipped_at ? (
                                                <div className="flex items-center gap-2 text-green-700 bg-green-100/50 px-3 py-1 rounded-lg border border-green-100">
                                                    <Truck className="w-4 h-4" />
                                                    <span className="font-bold text-sm">ارسال شده</span>
                                                    <span className="text-xs text-green-600 border-r border-green-200 pr-2 mr-2 font-mono font-bold select-all">
                                                        رهگیری: {trackingCode || '---'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-orange-700 bg-orange-100/50 px-3 py-1 rounded-lg border border-orange-100"><Package className="w-4 h-4" /><span className="font-bold text-sm">بسته‌بندی شده (منتظر ارسال)</span></div>
                                            )}
                                        </div>
                                    </div>
                                    {!fulfillment.shipped_at && (
                                        <Button onClick={() => handleCreateShipment(fulfillment.id)} disabled={actionLoading} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-sm">🚚 ثبت کد رهگیری</Button>
                                    )}
                                </div>
                            )})}
                        </div>
                    )}
                  </div>
              </div>
          </div>
          
          {/* سایدبار اطلاعات مشتری - بدون تغییر */}
          <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b"><User className="w-4 h-4" /> مشتری</h3>
                  <div className="space-y-3 text-sm">
                      <p className="flex justify-between"><span className="text-gray-500">نام:</span> <span>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</span></p>
                      <p className="flex justify-between"><span className="text-gray-500">تلفن:</span> <span>{order.shipping_address?.phone || "-"}</span></p>
                  </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b"><MapPin className="w-4 h-4" /> آدرس</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{order.shipping_address?.city}، {order.shipping_address?.address_1}<br/> کد پستی: {order.shipping_address?.postal_code}</p>
              </div>
          </div>
      </div>
    </div>
  );
}