import Medusa from "@medusajs/js-sdk";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// اکسپورت کردن URL
export const BACKEND_URL = MEDUSA_BACKEND_URL;

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";


export const medusaClient = new Medusa({
  baseUrl: BACKEND_URL,
  publishableKey: PUBLISHABLE_API_KEY, 
  debug: process.env.NODE_ENV === "development",
});

// ✅ تابع ضروری برای اکشن‌های پرداخت
export function getMedusaHeaders(tags: string[] = []) {
  return {
    "Content-Type": "application/json",
    "x-publishable-api-key": PUBLISHABLE_API_KEY,
  };
}

export const formatPrice = (amount: number | null | undefined, currencyCode: string = "irr") => {
  if (amount === null || amount === undefined) {
    return "۰ ریال";
  }

  const code = currencyCode.toLowerCase();

  if (code === "irr" || code === "irt") {

    const rialAmount = code === "irt" ? amount * 10 : amount;
    
    const formattedNumber = new Intl.NumberFormat("fa-IR", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(rialAmount);

    return `${formattedNumber} ریال`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};