"use server";

import { getAuthHeaders } from "@/lib/data-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function editAddressAction(addressId: string, prevState: any, formData: FormData) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  const authHeaders = await getAuthHeaders();

  const rawData = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company: formData.get("company"),
    address_1: formData.get("address_1"),
    city: formData.get("city"),
    country_code: "ir", 
    province: formData.get("province"),
    postal_code: formData.get("postal_code"),
    phone: formData.get("phone"),
  };

  try {
    console.log(`📝 [Edit Action] Updating address ${addressId}...`);

    const res = await fetch(`${BACKEND_URL}/store/customers/me/addresses/${addressId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
        ...authHeaders,
      },
      body: JSON.stringify(rawData),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("❌ Edit Error:", text);
        return { success: false, message: "خطا در ویرایش آدرس" };
    }

    console.log("✅ Address Updated!");

  } catch (error: any) {
    return { success: false, message: error.message };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}