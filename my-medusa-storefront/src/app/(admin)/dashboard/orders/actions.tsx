// src/app/(admin)/dashboard/orders/actions.ts
"use server";

import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// تعریف اینترفیس برای خروجی اکشن
interface ActionState {
  success: boolean;
  message: string;
}

export async function registerShipmentAction(
  prevState: any, // این آرگومان برای استفاده با useFormState الزامی است
  formData: FormData // تمام داده‌ها اینجا هستند
): Promise<ActionState> {
  
  // ۱. استخراج داده‌ها از FormData
  const orderId = formData.get("orderId") as string;
  const fulfillmentId = formData.get("fulfillmentId") as string;
  const tracking = formData.get("tracking") as string;

  // اعتبارسنجی اولیه
  if (!orderId || !fulfillmentId || !tracking) {
    return { success: false, message: "اطلاعات ارسال ناقص است." };
  }

  // ۲. دریافت توکن ادمین
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  if (!token) {
    return { success: false, message: "نشست کاربری نامعتبر است." };
  }

  try {
    // ۳. واکشی سفارش برای پیدا کردن آیتم‌های این fulfillment خاص
    // (این مرحله برای ساختار V2 ضروری است تا آیتم‌ها را پیدا کنیم)
    const orderRes = await fetch(
  `${MEDUSA_BACKEND_URL}/admin/orders/${orderId}?fields=+fulfillments.items`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    if (!orderRes.ok) throw new Error("سفارش یافت نشد");
    const { order } = await orderRes.json();

    // پیدا کردن fulfillment مورد نظر
    const targetFulfillment = order.fulfillments.find((f: any) => f.id === fulfillmentId);
    if (!targetFulfillment) throw new Error("بسته مورد نظر یافت نشد");

    // ۴. ارسال درخواست شیپمنت به مدوسا V2
    const shipmentPayload = {
      labels: [
        {
          tracking_number: tracking,
          tracking_url: `https://tracking.post.ir/?id=${tracking}`,
          label_url: "https://tracking.post.ir"
        },
      ],
    };

    const shipRes = await fetch(
  `${MEDUSA_BACKEND_URL}/admin/fulfillments/${fulfillmentId}/shipment`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentPayload),
      }
    );

    if (!shipRes.ok) {
      const errData = await shipRes.json();
      console.error("Medusa Shipment Error:", errData);
      throw new Error(errData.message || "خطا در ثبت شیپمنت");
    }

    // ۵. آپدیت کردن کش نکست
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, message: "کد رهگیری با موفقیت ثبت شد" };

  } catch (error: any) {
    console.error("Action Error:", error);
    return { success: false, message: error.message || "خطای غیرمنتظره" };
  }
}