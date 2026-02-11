"use server";

import { cookies } from "next/headers"; // 👈 اضافه کردن این خط

const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

// ✅ تابع کمکی هوشمند برای دریافت توکن
async function getAuthToken() {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("_medusa_admin_token")?.value;
  
  // اولویت با کوکی لاگین است، اگر نبود از توکن محیطی (env) استفاده کن
  return cookieToken || process.env.MEDUSA_ADMIN_TOKEN;
}

// ۱. دریافت لیست مشتریان
export async function getCustomersAction() {
  const API_TOKEN = await getAuthToken(); // 👈 استفاده از تابع جدید

  if (!API_TOKEN) {
    return { success: false, error: "دسترسی ندارید. لطفاً وارد شوید." };
  }

  try {
    const res = await fetch(`${BASE_URL}/admin/customers`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 401) return { success: false, error: "نشست کاربری منقضی شده است (401)" };
    if (!res.ok) return { success: false, error: `خطای سرور: ${res.status}` };

    const data = await res.json();
    return { success: true, customers: data.customers || [] };
  } catch (error) {
    console.error("List Error:", error);
    return { success: false, error: "خطای اتصال" };
  }
}

// ۲. دریافت جزئیات مشتری
export async function getCustomerDetailsAction(id: string) {
  const API_TOKEN = await getAuthToken(); // 👈 استفاده از تابع جدید
  
  if (!API_TOKEN || !id) return null;

  try {
    // دریافت موازی اطلاعات و سفارش‌ها (مثل قبل)
    const [customerRes, ordersRes] = await Promise.all([
      fetch(`${BASE_URL}/admin/customers/${id}?fields=*addresses`, {
        headers: { "Authorization": `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch(`${BASE_URL}/admin/orders?customer_id=${id}&fields=id,display_id,total,currency_code,created_at,payment_status`, {
        headers: { "Authorization": `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
        cache: "no-store",
      })
    ]);

    if (!customerRes.ok) return null;

    const customerData = await customerRes.json();
    const ordersData = await ordersRes.json();

    return {
      ...customerData.customer,
      shipping_addresses: customerData.customer.addresses || [],
      orders: ordersData.orders || []
    };

  } catch (error) {
    console.error("Detail Error:", error);
    return null;
  }
}