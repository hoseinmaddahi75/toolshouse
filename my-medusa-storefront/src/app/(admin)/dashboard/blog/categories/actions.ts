"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

// --- تابع کمکی برای گرفتن توکن ---
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token || ""}`, // ✅ کلید حل مشکل: ارسال توکن استاندارد
  };
}

// --- دریافت لیست ---
export async function getCategories() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/blog-categories`, {
      headers: headers,
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.categories || [];
  } catch (e) {
    console.error("Get Categories Error:", e);
    return [];
  }
}

// --- ساخت جدید ---
export async function createCategory(formData: FormData) {
  const headers = await getAuthHeaders();

  const rawData = {
    title: formData.get("title"),
    value: formData.get("value"),
  };

  try {
    const res = await fetch(`${BASE_URL}/admin/blog-categories`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
        const txt = await res.text();
        return { success: false, error: txt };
    }

    revalidatePath("/dashboard/blog/categories");
    revalidatePath("/dashboard/blog/create"); // برای آپدیت شدن لیست در صفحه ساخت پست
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- ویرایش ---
export async function updateCategory(id: string, formData: FormData) {
    const headers = await getAuthHeaders();
  
    const rawData = {
      title: formData.get("title"),
      value: formData.get("value"),
    };
  
    try {
      const res = await fetch(`${BASE_URL}/admin/blog-categories/${id}`, {
        method: "POST", // معمولا POST است، اگر بک‌اند PUT می‌خواهد تغییر دهید
        headers: headers,
        body: JSON.stringify(rawData),
      });
  
      if (!res.ok) {
          const txt = await res.text();
          return { success: false, error: txt };
      }
  
      revalidatePath("/dashboard/blog/categories");
      revalidatePath("/dashboard/blog/create");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
}

// --- حذف ---
export async function deleteCategory(id: string) {
  const headers = await getAuthHeaders();

  try {
    // برای متد DELETE معمولا Content-Type لازم نیست، اما Authorization لازم است
    // پس هدرها را دستی می‌سازیم یا Content-Type را از getAuthHeaders حذف می‌کنیم
    // اینجا از همان استفاده می‌کنیم چون ضرری ندارد
    const res = await fetch(`${BASE_URL}/admin/blog-categories/${id}`, {
      method: "DELETE",
      headers: headers,
    });

    if (!res.ok) return { success: false, error: "خطا در حذف" };

    revalidatePath("/dashboard/blog/categories");
    revalidatePath("/dashboard/blog/create");
    return { success: true };
  } catch (e) {
    return { success: false, error: "خطا در ارتباط" };
  }
}