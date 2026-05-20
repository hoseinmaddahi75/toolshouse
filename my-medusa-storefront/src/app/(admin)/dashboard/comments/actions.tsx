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
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token || ""}`, // ✅ ارسال توکن استاندارد
  };
}

// --- دریافت لیست نظرات ---
export async function getComments() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/comments`, {
      headers: headers,
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.comments || [];
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    return [];
  }
}

// --- تایید نظر (Approve) ---
export async function approveCommentAction(id: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/comments/${id}`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ status: "approved" }),
    });

    if (!res.ok) return { success: false, error: "خطا در تایید نظر" };

    revalidatePath("/dashboard/comments"); // آپدیت کش
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}

// --- حذف نظر ---
export async function deleteCommentAction(id: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/comments/${id}`, {
      method: "DELETE",
      headers: headers,
    });

    if (!res.ok) return { success: false, error: "خطا در حذف نظر" };

    revalidatePath("/dashboard/comments");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}