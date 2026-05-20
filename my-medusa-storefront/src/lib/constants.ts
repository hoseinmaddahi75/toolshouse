// مسیر: src/lib/constants.ts

// -----------------------------------------------------------------
// بخش اول: کدهای قبلی خودت (برای ترجمه دسته‌بندی‌ها که پاک شده بود)
// -----------------------------------------------------------------
export const CATEGORY_MAP: Record<string, string> = {
  // مقادیر انگلیسی
  "educational": "آموزشی",
  "news": "اخبار و اطلاعیه‌ها",
  "style": "استایل و مد",
  "trends": "ترندهای روز",
  "blog-posts": "مقالات وبلاگ",
  // مقادیر فارسی
  "آموزشی": "آموزشی",
  "اخبار": "اخبار و اطلاعیه‌ها",
};

export function getCategoryLabel(slug: string | null | undefined): string {
  if (!slug) return "بدون دسته‌بندی";
  return CATEGORY_MAP[slug] || slug;
}


// -----------------------------------------------------------------
// بخش دوم: کدهای جدید ما (برای حل مشکل ارتباط با سرور و ارور 500)
// -----------------------------------------------------------------
export const getBackendUrl = (): string => {
  // ۱. اگر در مرورگر کاربر هستیم، حتماً باید از آدرس پابلیک استفاده شود
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.toolshouse.ir";
  }

  // ۲. اگر در سمت سرور (Docker) هستیم، اولویت با شبکه داخلی داکر است
  if (process.env.MEDUSA_BACKEND_URL) {
    return process.env.MEDUSA_BACKEND_URL;
  }

  // ۳. حالت پیش‌فرض (فال‌بک)
  return process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
};

// صراحتاً نوع را string تعریف می‌کنیم
export const MEDUSA_BACKEND_URL: string = getBackendUrl();