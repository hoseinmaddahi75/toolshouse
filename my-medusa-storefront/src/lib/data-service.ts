"use server";

import { cookies } from "next/headers";

export async function getAuthHeaders() {
  const cookieStore = await cookies();
  let token = cookieStore.get("_medusa_jwt")?.value;

  // 1. خواندن کلید درست از محیط
  const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!publishableApiKey) {
    throw new Error("❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing in env!");
  }

  // 2. ساخت هدرهای پایه
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableApiKey,
  };

  // 3. اگر توکن داریم، تمیزش کن و اضافه کن
  if (token) {
    // حذف کوتیشن‌های احتمالی (پاک‌سازی)
    token = token.replace(/^"|"$/g, '');
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}