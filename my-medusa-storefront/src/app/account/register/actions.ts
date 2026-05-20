"use server";

import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function registerCustomerAction(formData: any) {
  const BASE_URL = MEDUSA_BACKEND_URL;
  const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!API_KEY) return { success: false, error: "تنظیمات API Key ناقص است." };

  const { email, password, first_name, last_name } = formData;

  try {
    // -----------------------------------------------------
    // 1️⃣ ثبت هویت (Auth)
    // -----------------------------------------------------
    console.log("1️⃣ Registering Auth Identity...");
    const authRes = await fetch(`${BASE_URL}/auth/customer/emailpass/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-publishable-api-key": API_KEY },
      body: JSON.stringify({ email, password, first_name, last_name }),
      cache: "no-store",
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      if (JSON.stringify(authData).includes("exists")) return { success: false, error: "این ایمیل قبلاً ثبت شده است." };
      return { success: false, error: authData.message || "خطا در ثبت نام." };
    }

    // توکن موقت (فقط برای ساخت مشتری استفاده می‌شود)
    const tempToken = authData.token || authData.access_token;

    // -----------------------------------------------------
    // 2️⃣ ساخت پروفایل مشتری (Create Customer)
    // -----------------------------------------------------
    console.log("2️⃣ Creating Customer Profile...");
    const customerRes = await fetch(`${BASE_URL}/store/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tempToken}`,
        "x-publishable-api-key": API_KEY,
      },
      body: JSON.stringify({ email, first_name, last_name }),
      cache: "no-store",
    });

    if (!customerRes.ok) {
      console.error("❌ Customer Creation Failed:", await customerRes.json());
      return { success: false, error: "هویت ساخته شد اما پروفایل مشتری ایجاد نشد." };
    }

    // -----------------------------------------------------
    // 3️⃣ دریافت توکن تازه (Re-Login) - ✅ فوت کوزه‌گری!
    // -----------------------------------------------------
    // توکن قبلی ناقص است چون قبل از ساخت مشتری صادر شده.
    // باید دوباره لاگین کنیم تا توکن جدید شامل Sales Channel و Customer ID باشد.
    console.log("3️⃣ Re-Logging in for Fresh Token...");
    
    const loginRes = await fetch(`${BASE_URL}/auth/customer/emailpass`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-publishable-api-key": API_KEY },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
  
    const loginData = await loginRes.json();
    
    // توکن نهایی و کامل
    const finalToken = loginData.access_token || loginData.token;

    if (!finalToken) {
        return { success: false, error: "ثبت نام شد ولی ورود خودکار انجام نشد." };
    }

    // -----------------------------------------------------
    // 4️⃣ ذخیره توکن نهایی
    // -----------------------------------------------------
    const cookieStore = await cookies();
    cookieStore.set({
      name: "_medusa_jwt",
      value: finalToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };

  } catch (error) {
    console.error("System Error:", error);
    return { success: false, error: "خطای سیستمی." };
  }
}