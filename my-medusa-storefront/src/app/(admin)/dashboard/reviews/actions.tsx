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
    "Authorization": `Bearer ${token || ""}`,
  };
}

// --- دریافت لیست نظرات (همراه با نام محصول) ---
export async function getProductReviews() {
  try {
    const headers = await getAuthHeaders();
    
    // 1. دریافت نظرات خام
    const res = await fetch(`${BASE_URL}/admin/product-reviews`, {
      headers: headers,
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    let reviews = data.reviews || [];

    // 2. 🚀 واکشی نام محصولات (Batch Fetching)
    // استخراج تمام آیدی‌های محصولات (بدون تکرار)
    const productIds = Array.from(new Set(reviews.map((r: any) => r.product_id).filter(Boolean)));

    if (productIds.length > 0) {
        try {
            // ساخت کوئری استرینگ برای دریافت چندین محصول همزمان
            // مثال: ?id[]=prod_1&id[]=prod_2&fields=id,title,thumbnail
            const queryParams = new URLSearchParams();
            productIds.forEach((id: any) => queryParams.append("id[]", id));
            queryParams.append("fields", "id,title,thumbnail"); // فقط فیلدهای لازم را می‌گیریم

            const prodRes = await fetch(`${BASE_URL}/admin/products?${queryParams.toString()}`, {
                headers: headers,
                cache: "no-store"
            });

            if (prodRes.ok) {
                const prodData = await prodRes.json();
                const products = prodData.products || [];

                // 3. ترکیب (Merge) نام محصول با نظرات
                reviews = reviews.map((r: any) => {
                    const foundProduct = products.find((p: any) => p.id === r.product_id);
                    return {
                        ...r,
                        product_title: foundProduct ? foundProduct.title : "محصول حذف شده",
                        product_thumbnail: foundProduct ? foundProduct.thumbnail : null
                    };
                });
            }
        } catch (err) {
            console.error("Failed to enrich reviews with product details", err);
        }
    }

    return reviews;
  } catch (error) {
    console.error("Fetch Reviews Error:", error);
    return [];
  }
}

// --- تغییر وضعیت (تایید/رد) ---
export async function updateReviewStatusAction(id: string, status: "approved" | "rejected") {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/product-reviews`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) return { success: false, error: "خطا در تغییر وضعیت" };

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}

// --- حذف نظر ---
export async function deleteReviewAction(id: string) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/admin/product-reviews`, {
      method: "DELETE",
      headers: headers,
      body: JSON.stringify({ id }),
    });

    if (!res.ok) return { success: false, error: "خطا در حذف نظر" };

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ارتباط با سرور" };
  }
}