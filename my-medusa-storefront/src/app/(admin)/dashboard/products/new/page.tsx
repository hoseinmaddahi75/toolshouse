// src/app/(admin)/dashboard/products/new/page.tsx
import { cookies } from "next/headers";
import CreateProductForm from "@/components/admin/create-product-form";

export default async function CreateProductPage() {
  // ۱. دریافت کوکی‌ها سمت سرور
  const cookieStore = await cookies();
  
  // ۲. استخراج توکن ادمین
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  // ۳. ارسال توکن به فرم کلاینت
  return <CreateProductForm token={token} />;
}