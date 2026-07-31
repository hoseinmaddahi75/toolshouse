export function extractCustomerIdFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      return payload.actor_id || payload.app_metadata?.customer_id || null;
    }
    return token;
  } catch {
    return null;
  }
}
