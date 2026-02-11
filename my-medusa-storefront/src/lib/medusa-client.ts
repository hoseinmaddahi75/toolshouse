import Medusa from "@medusajs/js-sdk";

// اکسپورت کردن URL
export const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const PUBLISHABLE_API_KEY = "pk_82b953b964ad71f051bb02d1382200901c260d0e8628f845fd00856125b14336";

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
    return "۰ تومان";
  }

  const code = currencyCode.toLowerCase();

  if (code === "irr" || code === "irt") {
    const tomanAmount = code === "irr" ? Math.floor(amount / 10) : amount;
    const formattedNumber = new Intl.NumberFormat("fa-IR", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(tomanAmount);

    return `${formattedNumber} تومان`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};