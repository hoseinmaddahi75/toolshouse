"use server";

import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

export async function loginAdminAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${BASE_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: "ایمیل یا رمز عبور اشتباه است." };
    }

    // ✅ اصلاح مهم: دریافت توکن با هر دو نام احتمالی
    const token = data.access_token || data.token;

    if (!token) {
        console.error("❌ Token missing. Data received:", data);
        return { success: false, error: "خطا در دریافت توکن از سرور." };
    }

    // ذخیره توکن در کوکی
    (await cookies()).set("_medusa_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // ۷ روز
      path: "/",
    });

    return { success: true };

  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "خطای اتصال به سرور." };
  }
}