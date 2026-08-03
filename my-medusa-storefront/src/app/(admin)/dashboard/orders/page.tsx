// src/app/(admin)/dashboard/orders/page.tsx
import { cookies } from "next/headers";
import OrdersTable from "@/components/admin/orders-table"; // ایمپورت کامپوننت جدید
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

// تابع فچ کردن سفارشات (سمت سرور)
async function getOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
const backendUrl = MEDUSA_BACKEND_URL;

  if (!token) return { orders: [], count: 0 };

  try {
    // پارامترها برای Medusa V2
    // نکته مهم: در V2 برای گرفتن ریلیشن‌ها از + استفاده می‌کنیم
    const params = new URLSearchParams({
      limit: "50",
      order: "-created_at",
      fields: "+items,+shipping_address,+customer", // 👈 اینجوری مطمئن می‌شیم آیتم‌ها و آدرس میان
    });

    const res = await fetch(`${backendUrl}/admin/orders?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 🔑 کلید طلایی
      },
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) {
      console.error(`Orders Fetch Error: ${res.status}`);
      return { orders: [], count: 0 };
    }

    const data = await res.json();
    return { 
      orders: data.orders || [], 
      count: data.count || data.orders?.length || 0 
    };

  } catch (error) {
    console.error("Network Error:", error);
    return { orders: [], count: 0 };
  }
}

export default async function AdminOrdersPage() {
  // دیتا قبل از رندر شدن صفحه آماده می‌شود (بدون لودینگ اسپینر!)
  const { orders, count } = await getOrders();

  return <OrdersTable orders={orders} count={count} />;
}