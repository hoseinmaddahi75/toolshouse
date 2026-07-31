"use server";

import { getAuthDataFromCookie } from "./auth";

export async function getAuthHeaders() {
  const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

  if (!publishableApiKey) {
    throw new Error("❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing in env!");
  }

  const { customerId, jwt } = await getAuthDataFromCookie();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-publishable-api-key": publishableApiKey,
  };

  if (jwt) {
    headers["Authorization"] = `Bearer ${jwt}`;
  }

  if (customerId) {
    headers["x-customer-id"] = customerId;
  }

  return headers;
}
