"use server";

import { cookies } from "next/headers";

export async function getCustomerIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value;
  if (!token) return null;
  return await extractCustomerId(token);
}

export async function getJwtFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("_medusa_jwt")?.value || null;
}

export async function getAuthDataFromCookie(): Promise<{ customerId: string | null; jwt: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_jwt")?.value || null;
  if (!token) return { customerId: null, jwt: null };
  return { customerId: await extractCustomerId(token), jwt: token };
}

export async function extractCustomerId(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(Buffer.from(base64, "base64").toString());
      return payload.actor_id || payload.app_metadata?.customer_id || null;
    }
    return token;
  } catch {
    return null;
  }
}
