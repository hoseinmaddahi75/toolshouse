"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { getCustomerIdFromCookie } from "@/lib/auth";

const BASE_URL = MEDUSA_BACKEND_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

async function getHeaders() {
  const customerId = await getCustomerIdFromCookie();
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_KEY,
    "x-customer-id": customerId || "",
  };
}

// افزودن آدرس
export async function addAddressAction(prevState: any, formData: FormData) {
  const headers = await getHeaders();

  const payload = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    province: formData.get("province"),
    city: formData.get("city"),
    address_1: formData.get("address_1"),
    postal_code: formData.get("postal_code"),
  };

  try {
    const res = await fetch(`${BASE_URL}/store/custom-addresses`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.message || "خطا در ثبت آدرس" };
    }

  } catch (e) {
    return { success: false, message: "خطای شبکه رخ داد" };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

// حذف آدرس
export async function deleteAddressAction(addressId: string) {
  const headers = await getHeaders();

  try {
    const res = await fetch(`${BASE_URL}/store/custom-addresses/${addressId}`, {
      method: "DELETE",
      headers: headers,
    });

    if (!res.ok) throw new Error("خطا در حذف");

    revalidatePath("/account/addresses");
    return { success: true };
  } catch (e) {
    return { success: false, message: "امکان حذف وجود ندارد" };
  }
}

// ویرایش آدرس
export async function editAddressAction(addressId: string, prevState: any, formData: FormData) {
  const headers = await getHeaders();

  const payload = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    province: formData.get("province"),
    city: formData.get("city"),
    address_1: formData.get("address_1"),
    postal_code: formData.get("postal_code"),
  };

  try {
    const res = await fetch(`${BASE_URL}/store/custom-addresses/${addressId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const err = await res.json();
        return { success: false, message: err.message || "خطا در ویرایش" };
    }

  } catch (e) {
    return { success: false, message: "خطای شبکه" };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}