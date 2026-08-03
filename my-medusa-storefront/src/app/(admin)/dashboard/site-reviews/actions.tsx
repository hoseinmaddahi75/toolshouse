"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

// --- تابع کمکی احراز هویت ---
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
  return {
    "Authorization": `Bearer ${token || ""}`, // ✅ توکن
    // نکته: Content-Type را اینجا نگذارید چون برای آپلود فایل (FormData) نباید دستی ست شود
  };
}

// --- دریافت لیست ---
export async function getSiteReviews() {
  try {
    const headers = await getAuthHeaders();
    // برای GET مشکلی نیست اگر Content-Type نباشد
    const res = await fetch(`${BASE_URL}/admin/reviews`, {
      headers: { ...headers, "Content-Type": "application/json" },
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.reviews || [];
  } catch (error) {
    console.error("Fetch Site Reviews Error:", error);
    return [];
  }
}

// --- آپلود تصویر ---
export async function uploadReviewImage(formData: FormData) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/uploads`, {
      method: "POST",
      headers: headers, // ❌ بدون Content-Type دستی
      body: formData,
      credentials: "include",
    });

    if (res.ok) {
        const data = await res.json();
        return { success: true, url: data.files?.[0]?.url || "" };
    }
    return { success: false, error: "آپلود نشد" };
  } catch (e) {
    return { success: false, error: "خطا در آپلود" };
  }
}

// --- ذخیره (ایجاد یا ویرایش) ---
export async function saveSiteReviewAction(data: any, id?: string) {
  try {
    const headers = await getAuthHeaders();
    const url = id ? `${BASE_URL}/admin/reviews/${id}` : `${BASE_URL}/admin/reviews`;
    
    const res = await fetch(url, {
      method: "POST", // طبق API شما هر دو POST هستند
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) return { success: false, error: "خطا در ذخیره سازی" };

    revalidatePath("/dashboard/site-reviews");
    return { success: true };
  } catch (e) {
    return { success: false, error: "خطا در ارتباط" };
  }
}

// --- حذف ---
export async function deleteSiteReviewAction(id: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/reviews/${id}`, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) return { success: false, error: "خطا در حذف" };

    revalidatePath("/dashboard/site-reviews");
    return { success: true };
  } catch (e) {
    return { success: false, error: "خطا در ارتباط" };
  }
}