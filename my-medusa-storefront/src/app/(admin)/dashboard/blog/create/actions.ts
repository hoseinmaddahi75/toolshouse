"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

// --- تابع کمکی برای دریافت توکن ---
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("_medusa_admin_token")?.value || "";
}

// --- دریافت دسته‌بندی‌ها ---
export async function getBlogCategories() {
  const token = await getAuthToken();
  try {
    const res = await fetch(`${BASE_URL}/admin/blog-categories`, {
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ اصلاح امنیتی
      },
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// --- دریافت یک پست تکی ---
export async function getPost(id: string) {
    const token = await getAuthToken();
    
    try {
      // ✅ بهینه‌سازی: درخواست مستقیم برای پست خاص
      const res = await fetch(`${BASE_URL}/admin/blog/${id}`, {
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        cache: "no-store",
      });
      
      if(res.ok) {
          const data = await res.json();
          return data.post || null;
      }
      
      console.error(`Post not found or Error (${res.status})`);
      return null;
    } catch (error) {
      console.error("Error finding post:", error);
      return null;
    }
}

// --- آپلود تصویر در مدوسا ---
async function uploadImageToMedusa(file: File, token: string) {
    const formData = new FormData();
    formData.append("files", file);

    try {
        const res = await fetch(`${BASE_URL}/admin/uploads`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}` 
                // ❌ نکته مهم: Content-Type را اینجا ست نکنید! 
                // خودِ fetch وقتی FormData می‌بیند، boundary را تنظیم می‌کند.
            },
            body: formData,
        });

        if (res.ok) {
            const data = await res.json();
            
            // پشتیبانی از هر دو ساختار احتمالی مدوسا
            if (data.files?.length > 0) return data.files[0].url;
            if (data.uploads?.length > 0) return data.uploads[0].url;

            console.error("Upload successful but structure unknown:", data);
            return null;
        }

        const errorText = await res.text();
        console.error("Upload failed:", errorText);
        return null;

    } catch (e) {
        console.error("Upload error:", e);
        return null;
    }
}

// --- ذخیره پست (ایجاد یا ویرایش) ---
export async function savePostAction(formData: FormData, isEditMode: boolean = false, editId: string = "") {
  const token = await getAuthToken();

  // اگر توکن نبود، یعنی سشن منقضی شده
  if (!token) {
    return { success: false, error: "نشست کاربری منقضی شده است. لطفاً مجدد وارد شوید." };
  }

  try {
    // 1. مدیریت آپلود تصویر
    let imageUrl = formData.get("existing_image") as string;
    const imageFile = formData.get("image_file") as File;

    if (imageFile && imageFile.size > 0) {
        const uploadedUrl = await uploadImageToMedusa(imageFile, token);
        if (uploadedUrl) {
            imageUrl = uploadedUrl;
        } else {
            return { success: false, error: "آپلود تصویر انجام نشد." };
        }
    }

    // 2. آماده‌سازی داده‌ها
    const rawData = {
        title: formData.get("title"),
        slug: formData.get("slug"),
        content: formData.get("content"), 
        excerpt: formData.get("excerpt"),
        seo_desc: formData.get("seo_desc"),
        seo_title: formData.get("seo_title"),
        image: imageUrl,
        category: formData.get("category"),
        status: formData.get("status") || "draft",
    };

    // 3. تعیین آدرس و متد
    let url = `${BASE_URL}/admin/blog`;
    // معمولا برای آپدیت هم POST کار می‌کند اما اگر ساختار REST دارید شاید PUT باشد
    // فعلا روی POST نگه می‌داریم چون با اکسپرس معمول‌تر است
    if (isEditMode && editId) {
        url = `${BASE_URL}/admin/blog/${editId}`;
    }

    const res = await fetch(url, {
      method: "POST", // یا PUT بسته به بک‌اند شما
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ اصلاح امنیتی
      },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { success: false, error: `خطای سرور (${res.status}): ${txt}` };
    }

    // پاکسازی کش
    revalidatePath("/dashboard/blog");
    if(rawData.slug) revalidatePath(`/blog/${rawData.slug}`);
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }

  redirect("/dashboard/blog");
}

// --- حذف پست ---
export async function deletePostAction(id: string) {
    const token = await getAuthToken();
  
    try {
      const res = await fetch(`${BASE_URL}/admin/blog/${id}`, {
        method: "DELETE",
        headers: { 
            "Authorization": `Bearer ${token}` // ✅ اصلاح امنیتی
        },
      });
  
      if (res.ok) {
        revalidatePath("/dashboard/blog");
        return { success: true };
      }
      return { success: false, error: "خطا در حذف پست" };
    } catch (e) {
      return { success: false, error: "خطا در برقراری ارتباط با سرور" };
    }
}