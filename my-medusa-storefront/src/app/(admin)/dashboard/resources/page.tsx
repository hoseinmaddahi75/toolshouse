// src/app/(admin)/dashboard/resources/page.tsx
import { cookies } from "next/headers";
import ResourcesManagement from "@/components/admin/resources-management";

export default async function ResourcesPage() {
  // ۱. دریافت کوکی‌ها سمت سرور
  const cookieStore = await cookies();
  
  // ۲. استخراج توکن ادمین
  const token = cookieStore.get("_medusa_admin_token")?.value || "";

  // ۳. ارسال توکن به فرم کلاینت
  return <ResourcesManagement token={token} />;
}