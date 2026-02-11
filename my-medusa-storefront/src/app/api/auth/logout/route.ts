import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // 1. حذف کوکی مشتری
  cookieStore.delete("_medusa_jwt");
  
  // 2. حذف کوکی ادمین (محض احتیاط)
  cookieStore.delete("_medusa_admin_token");

  // 3. درخواست به مدوسا برای کشتن سشن (اختیاری ولی خوب)
  const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  try {
    await fetch(`${BASE_URL}/auth/session`, {
      method: "DELETE",
      credentials: "include", // اگر کوکی‌های مدوسا را هم دارید
    });
  } catch (e) {
    console.error("Medusa logout error (ignored):", e);
  }

  // 4. بازگشت پاسخ موفقیت و ریدایرکت سمت کلاینت هندل می‌شود
  return NextResponse.json({ success: true });
}