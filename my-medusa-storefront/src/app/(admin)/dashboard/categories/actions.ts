"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

// تابع اصلی برای دریافت توکن از کوکی
export async function getAdminToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
  
  if (!token) {
    console.log("⛔ Token not found in cookies");
    redirect("/admin/login");
  }
  
  return token;
}

// تابع عمومی برای تمام متدها (GET, POST, PUT, DELETE)
export async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAdminToken();
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    cache: "no-store",
  });
  
  if (res.status === 401) {
    console.log("⛔ Token expired (401)");
    redirect("/admin/login");
  }
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`❌ API Error ${res.status} on ${endpoint}:`, errorData);
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }
  
  return await res.json();
}

// توابع اختصاصی برای دستهبندیها
export async function getCategoriesAction() {
  return adminFetch(`/admin/product-categories?limit=1000`);
}

export async function createCategoryAction(data: {
  name: string;
  handle: string;
  description?: string;
  is_active: boolean;
  is_internal: boolean;
  parent_category_id: string | null;
}) {
  return adminFetch(`/admin/product-categories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategoryAction(
  id: string,
  data: {
    name: string;
    handle: string;
    description?: string;
    is_active: boolean;
    is_internal: boolean;
    parent_category_id: string | null;
  }
) {
  return adminFetch(`/admin/product-categories/${id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCategoryAction(id: string) {
  return adminFetch(`/admin/product-categories/${id}`, {
    method: "DELETE",
  });
}
