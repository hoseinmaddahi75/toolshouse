// مسیر: src/lib/constants.ts (در فرانت‌اند)

export const CATEGORY_MAP: Record<string, string> = {
  // فرمت: "مقدار دیتابیس": "نمایش فارسی"
  
  // مقادیر انگلیسی (که جدیدا ذخیره می‌شوند)
  "educational": "آموزشی",
  "news": "اخبار و اطلاعیه‌ها",
  "style": "استایل و مد",
  "trends": "ترندهای روز",
  "blog-posts": "مقالات وبلاگ",
  
  // مقادیر فارسی (برای پشتیبانی از مقالات قدیمی)
  "آموزشی": "آموزشی",
  "اخبار": "اخبار و اطلاعیه‌ها",
};

// یک تابع کمکی ساده برای استفاده راحت‌تر
export function getCategoryLabel(slug: string | null | undefined): string {
  if (!slug) return "بدون دسته‌بندی";
  return CATEGORY_MAP[slug] || slug; // اگر در لیست بود ترجمه کن، اگر نبود خودش را نشان بده
}