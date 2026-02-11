"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addAddressAction(prevState: any, formData: FormData) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  // مطمئن شویم که کلید حتماً وجود دارد
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!API_KEY) {
    console.error("❌ Fatal: Publishable Key is missing in Action.");
    return { success: false, message: "خطای تنظیمات سرور: کلید API یافت نشد." };
  }

  // 1. دریافت و تمیزکاری توکن (مثل فایل layout)
  const cookieStore = await cookies();
  let token = cookieStore.get("_medusa_jwt")?.value;

  if (!token) {
    return { success: false, message: "لطفا مجدداً وارد شوید." };
  }

  // حذف کوتیشن‌های مزاحم
  token = token.replace(/^"|"$/g, '');

  // 2. آماده‌سازی دیتا
  const rawData = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company: formData.get("company"),
    address_1: formData.get("address_1"),
    city: formData.get("city"),
    country_code: "ir", // ایران به صورت سخت‌کد
    province: formData.get("province"),
    postal_code: formData.get("postal_code"),
    phone: formData.get("phone"),
  };

  try {
    console.log("📤 [Server Action] Sending address...");

    const res = await fetch(`${BACKEND_URL}/store/customers/me/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // توکن تمیز شده
        "x-publishable-api-key": API_KEY,   // کلید مطمئن
      },
      body: JSON.stringify(rawData),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Backend Error Add Address:", errorText);
      
      try {
        const json = JSON.parse(errorText);
        return { success: false, message: json.message || "خطای اعتبار سنجی" };
      } catch {
        return { success: false, message: "خطای ناشناخته در ثبت آدرس" };
      }
    }

    console.log("✅ Address Created Successfully!");
    
  } catch (error: any) {
    console.error("💥 Action Error:", error);
    return { success: false, message: "خطای ارتباط با سرور" };
  }

  // موفقیت
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}