// src/app/(admin)/dashboard/orders/[id]/page.tsx
import { cookies } from "next/headers";
import OrderDetailsView from "@/components/admin/order-details-view";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ۱. دریافت کوکی‌ها سمت سرور
  const cookieStore = await cookies();
  
  // ۲. استخراج توکن ادمین
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  // ۳. ارسال توکن و ID به فرم کلاینت
  return <OrderDetailsView id={id} token={token} />;
}