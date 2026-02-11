// src/app/(admin)/dashboard/products/[id]/edit/page.tsx
import { cookies } from "next/headers";
import EditProductForm from "@/components/admin/edit-product-form"; // ایمپورت کامپوننت جدید

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ۱. دریافت کوکی‌ها سمت سرور
  const cookieStore = await cookies();
  
  // ۲. استخراج توکن ادمین
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  // ۳. ارسال توکن به فرم کلاینت
  return <EditProductForm id={id} token={token} />;
}