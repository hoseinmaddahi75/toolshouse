"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

export async function adminFetch(endpoint: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  // اگر توکن نبود، یعنی لاگین نیست
  if (!token) {
    console.log("⛔ Token not found in cookies");
    redirect("/admin/login");
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      console.log("⛔ Token expired (401)");
      redirect("/admin/login");
    }

    if (!res.ok) {
      console.error(`❌ API Error ${res.status} on ${endpoint}`);
      return null;
    }

    return await res.json();
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("💥 Network Error:", error);
    return null;
  }
}