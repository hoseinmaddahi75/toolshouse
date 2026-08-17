// src/app/(admin)/dashboard/orders/page.tsx
import { cookies } from "next/headers";
import OrdersTable from "@/components/admin/orders-table";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  // 💡 تغییر به Promise
  searchParams: Promise<{ page?: string }>;
}) {
  // 💡 باز کردن Promise با await
  const params = await searchParams;
  
  const page = Number(params?.page) || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  // 🟢 تعریف متغیر محلی backendUrl با استفاده از کانستنت پروژه (منتقل شده از داروبرگ)
  const backendUrl = MEDUSA_BACKEND_URL;

  let orders = [];
  let count = 0;

  if (token) {
    try {
      const apiParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        order: "-created_at",
        fields: "+items,+shipping_address.first_name,+shipping_address.last_name,+customer.first_name,+customer.last_name,+customer.email",
      });

      // 🟢 استفاده از متغیر محلی backendUrl در مسیر fetch
      const res = await fetch(`${backendUrl}/admin/orders?${apiParams.toString()}`, {
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

  return (
    <OrdersTable 
      orders={orders} 
      count={count} 
      currentPage={page} 
      limit={limit} 
    />
  );
}