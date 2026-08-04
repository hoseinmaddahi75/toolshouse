import { cookies } from "next/headers";
import OrdersTable from "@/components/admin/orders-table";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

// 💡 اضافه شدن searchParams برای خواندن شماره صفحه از URL
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams?.page) || 1;
  const limit = 15; // تعداد سفارش در هر صفحه (قابل تغییر)
  const offset = (page - 1) * limit; // محاسبه نقطه شروع

  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  let orders = [];
  let count = 0;

  if (token) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(), // 💡 ارسال آفست به مدوسا
        order: "-created_at",
        fields: "+items,+shipping_address.first_name,+shipping_address.last_name,+customer.first_name,+customer.last_name,+customer.email",
      });

      const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/orders?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        orders = data.orders || [];
        count = data.count || 0;
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  }

  // پاس دادن اطلاعات صفحه‌بندی به کامپوننت جدول
  return (
    <OrdersTable 
      orders={orders} 
      count={count} 
      currentPage={page} 
      limit={limit} 
    />
  );
}