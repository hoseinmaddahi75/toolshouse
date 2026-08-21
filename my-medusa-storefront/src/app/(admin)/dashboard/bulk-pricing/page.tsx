import BulkPricingClient from "./BulkPricingClient";
import { cookies } from "next/headers";

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default async function BulkPricingPage() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  // 🌟 استخراج توکن از کوکی‌ها 
  // نکته مهم: اگر در سیستم لاگین خودتان اسم کوکی چیز دیگری است (مثلا my_token)، آن را به این لیست اضافه کنید
  const token = 
    cookieStore.get("_medusa_admin_token")?.value || 
    cookieStore.get("admin_token")?.value || 
    cookieStore.get("token")?.value || 
    cookieStore.get("jwt")?.value;

  // تنظیم هدرها
  const headers: HeadersInit = {
    "Cookie": cookieString, // ارسال کوکی‌ها برای احتیاط
  };

  // 🌟 اگر توکن پیدا شد، هدر استاندارد Authorization را اضافه کن
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/bulk-details`, {
      headers, // استفاده از هدرهای جدید
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("API Error Status:", res.status);
      throw new Error("خطا در دریافت اطلاعات از سرور");
    }

    const data = await res.json();
    const products = data.products || [];

    return (
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <BulkPricingClient initialProducts={products} />
      </div>
    );
  } catch (error) {
    console.error("Fetch Bulk Error:", error);
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center">
          <h2 className="font-bold text-lg mb-2">ارتباط با سرور برقرار نشد!</h2>
          <p className="text-sm">
            لطفاً مطمئن شوید که لاگین هستید و سرور بک‌اند مدوسا در حال اجراست.
          </p>
        </div>
      </div>
    );
  }
}