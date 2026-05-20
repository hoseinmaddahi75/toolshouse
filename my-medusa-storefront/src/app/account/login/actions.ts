"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return "لطفا ایمیل و رمز عبور را وارد کنید.";
  }

  // متغیر برای تشخیص موفقیت لاگین
  let isSuccess = false;

  try {
    const medusaUrl = MEDUSA_BACKEND_URL;
    // ✅ اصلاح نام متغیر محیطی طبق فایل env شما
    const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

    console.log("Login Action Started for:", email);

    const response = await fetch(`${medusaUrl}/auth/customer/emailpass`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableApiKey!,
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Login Failed Status:", response.status);
      return "ایمیل یا رمز عبور اشتباه است.";
    }

    const data = await response.json();
    
    // ✅ در نسخه ۲ معمولا access_token برمی‌گردد، اما محض احتیاط هر دو را چک می‌کنیم
    const token = data.access_token || data.token;

    if (!token) {
      console.error("No token found in response:", data);
      return "خطای سیستم: توکن دریافت نشد.";
    }

    console.log("✅ Token received successfully!");

    const cookieStore = await cookies();
    
    cookieStore.set({
      name: "_medusa_jwt",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // ۷ روز
    });

    revalidatePath("/account");
    isSuccess = true; // علامت می‌زنیم که موفق بودیم

  } catch (error) {
    console.error("Login System Error:", error);
    return "خطایی در برقراری ارتباط رخ داد.";
  }

  // 🚨 نکته حیاتی: ریدارکت باید بیرون از try/catch باشد
  if (isSuccess) {
    redirect("/account");
  }
}