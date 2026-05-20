"use server";

import { getAuthHeaders } from "@/lib/data-service";
import { revalidatePath } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export async function updateProfileAction(prevState: any, formData: FormData) {
  const BACKEND_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  const authHeaders = await getAuthHeaders();

  const rawData = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    // ایمیل معمولاً به راحتی قابل تغییر نیست و نیاز به تایید دارد، فعلاً فاکتور می‌گیریم
  };

  try {
    console.log("📤 [Profile] Updating customer info...");

    const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
      method: "POST", // در مدوسا برای آپدیت معمولا از POST روی me استفاده می‌شود
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        ...authHeaders,
      },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Profile Update Error:", text);
      return { success: false, message: "خطا در بروزرسانی اطلاعات" };
    }

    console.log("✅ Profile Updated!");
    
    // کش را پاک می‌کنیم تا نام جدید در سایدبار هم آپدیت شود
    revalidatePath("/account"); 
    
    return { success: true, message: "اطلاعات با موفقیت ذخیره شد" };
    
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}


// ... کدهای قبلی (updateProfileAction) سر جایشان باشند ...

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const BACKEND_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  // ۱. اعتبارسنجی سمت سرور
  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: "رمز عبور باید حداقل ۶ کاراکتر باشد" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "رمز عبور و تکرار آن مطابقت ندارند" };
  }

  const authHeaders = await getAuthHeaders();

  try {
    console.log("🔐 [Profile] Updating Password...");

    const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        ...authHeaders,
      },
      // در مدوسا، ارسال فیلد password در آپدیت مشتری، رمز را تغییر می‌دهد
      body: JSON.stringify({ password: newPassword }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Password Update Error:", text);
      return { success: false, message: "خطا در تغییر رمز عبور" };
    }

    return { success: true, message: "رمز عبور با موفقیت تغییر کرد" };
    
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}