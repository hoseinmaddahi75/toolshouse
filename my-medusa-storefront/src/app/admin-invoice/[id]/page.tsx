import { cookies } from "next/headers";
import { formatPrice } from "@/lib/medusa-client";
import PrintButton from "@/components/admin/print-button";

async function getOrderData(id: string) {
  const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  if (!token) return null;

  // ✅ اضافه کردن فیلدهای حیاتی: items, shipping_address, shipping_methods
  const query = new URLSearchParams({
    fields: "id,display_id,created_at,email,currency_code,total,subtotal,shipping_total,tax_total,status,*items,*shipping_address,*shipping_methods"
  });

  const res = await fetch(`${BASE_URL}/admin/orders/${id}?${query.toString()}`, {
    headers: { "Authorization": `Bearer ${token}` },
    cache: "no-store"
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.order;
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderData(id);

  if (!order) return <div className="p-10 text-center">سفارش یافت نشد یا دسترسی منقضی شده است.</div>;

  return (
    <div className="bg-white min-h-screen text-right font-sans" dir="rtl">
      {/* دکمه پرینت (در چاپ مخفی می‌شود) */}
      <div className="fixed top-4 left-4 print:hidden z-50">
        <PrintButton />
      </div>

      <div className="max-w-[210mm] mx-auto p-12 bg-white">
        {/* هدر فاکتور */}
        <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-10">
          <div>
            <h1 className="text-4xl font-black mb-4">فاکتور فروش</h1>
            <p>شماره: <span className="font-bold">#{order.display_id}</span></p>
            <p>تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold">فروشگاه خانه ابزار</h2>
            <p className="text-sm text-gray-500">فاکتور رسمی فروش آنلاین</p>
          </div>
        </div>

        {/* اطلاعات خریدار */}
        <div className="border rounded-xl p-6 mb-10 bg-gray-50">
          <h3 className="font-bold border-b pb-2 mb-4">مشخصات خریدار</h3>
          
          {/* 👇 تغییرات در اینجا: اضافه شدن کد پستی به گرید */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-8 text-sm">
            <p>نام: {order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
            <p>تلفن: {order.shipping_address?.phone || "-"}</p>
            <p>کد پستی: {order.shipping_address?.postal_code || "-"}</p>
            
            {/* آدرس کامل که کل عرض را می‌گیرد */}
            <p className="col-span-2 border-t pt-2 mt-2">
                <span className="font-bold ml-2">نشانی:</span> 
                {order.shipping_address?.city}، {order.shipping_address?.address_1}
            </p>
          </div>
        </div>

        {/* جدول محصولات */}
        <table className="w-full border-collapse mb-10">
          <thead>
            <tr className="bg-gray-100 border-y-2 border-black">
              <th className="p-3 text-right">شرح کالا</th>
              <th className="p-3 text-center">تعداد</th>
              <th className="p-3 text-left">مبلغ واحد (تومان)</th>
              <th className="p-3 text-left">مبلغ کل (تومان)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="p-3 font-medium">{item.title}</td>
                <td className="p-3 text-center">{item.quantity}</td>
                <td className="p-3 text-left">{formatPrice(item.unit_price, order.currency_code)}</td>
                <td className="p-3 text-left font-bold">{formatPrice(item.unit_price * item.quantity, order.currency_code)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* جمع نهایی */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between">
              <span>جمع جزء:</span>
              <span>{formatPrice(order.subtotal, order.currency_code)}</span>
            </div>
            <div className="flex justify-between">
              <span>هزینه ارسال:</span>
              <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
            </div>
            <div className="flex justify-between font-black text-xl border-t-2 border-black pt-2">
              <span>جمع کل:</span>
              <span>{formatPrice(order.total, order.currency_code)}</span>
            </div>
          </div>
        </div>

        {/* فوتر */}
        <div className="mt-20 grid grid-cols-2 text-center">
          <div>
            <p className="font-bold mb-16">مهر و امضای فروشنده</p>
            <div className="w-40 h-1 bg-gray-200 mx-auto border-t border-dashed border-gray-400"></div>
          </div>
          <div>
            <p className="font-bold mb-16">امضای خریدار</p>
            <div className="w-40 h-1 bg-gray-200 mx-auto border-t border-dashed border-gray-400"></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. مخفی کردن اجزای مزاحم سایت اصلی */
        header, footer, nav, .site-header, .site-footer {
            display: none !important;
        }

        /* 2. تنظیمات پرینت */
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; padding: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}