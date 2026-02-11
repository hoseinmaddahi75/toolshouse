// src/app/(admin)/dashboard/attributes/page.tsx
import { cookies } from "next/headers";
import AttributesManagement from "@/components/admin/attributes-management";

export default async function AttributesPage() {
  // ۱. دریافت کوکی‌ها سمت سرور
  const cookieStore = await cookies();
  
  // ۲. استخراج توکن ادمین
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  // ۳. ارسال توکن به فرم کلاینت
  return <AttributesManagement token={token} />;
}