"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/medusa-client";
import { useMemo } from "react";
import WishlistButton from "@/components/products/wishlist-button";

interface ProductCardProps {
  product: any;
}

// 👇 ۱. تابع کمکی تبدیل رنگ (بدون تغییر)
const getColorHex = (colorName: string) => {
  if (!colorName) return "#000";
  const normalized = colorName.toLowerCase();
  const colors: Record<string, string> = {
    "مشکی": "#000000", "black": "#000000",
    "سفید": "#ffffff", "white": "#ffffff",
    "قرمز": "#ff0000", "red": "#ff0000",
    "آبی": "#0000ff", "blue": "#0000ff",
    "سبز": "#008000", "green": "#008000",
    "زرد": "#ffff00", "yellow": "#ffff00",
    "beige": "#F5F5DC", "کرم": "#F5F5DC",
    "navy": "#000080", "سورمه‌ای": "#000080",
    "grey": "#808080", "gray": "#808080", "خاکستری": "#808080",
  };
  return colors[normalized] || normalized;
};

// 👇 ۲. تابع هوشمند استخراج قیمت از واریانت
const getVariantPrice = (variant: any) => {
  if (!variant) return 0;

  // الف: اولویت با قیمت محاسبه شده توسط مدوسا (اگر وجود داشت)
  if (typeof variant.calculated_price === "number") return variant.calculated_price;
  if (variant.calculated_price?.calculated_amount) return variant.calculated_price.calculated_amount;

  // ب: جستجو در آرایه قیمت‌ها (اگر calculated_price نبود)
  if (variant.prices && Array.isArray(variant.prices) && variant.prices.length > 0) {
    // ۱. تلاش برای پیدا کردن ریال یا تومان (بدون حساسیت به حروف بزرگ/کوچک)
    const irrPrice = variant.prices.find((p: any) => 
      p.currency_code && ["irr", "irt"].includes(p.currency_code.toLowerCase())
    );
    if (irrPrice) return irrPrice.amount;

    // ۲. اگر ریال نبود، اولین قیمتی که صفر نیست را برگردان
    const anyPrice = variant.prices.find((p: any) => p.amount > 0);
    if (anyPrice) return anyPrice.amount;
  }

  return 0;
};

// 👇 ۳. تابع هوشمند استخراج قیمت اصلی (برای خط خورده)
const getVariantOriginalPrice = (variant: any) => {
    if (!variant) return 0;
    // تلاش برای پیدا کردن original_price در ساختارهای مختلف
    if (typeof variant.original_price === "number") return variant.original_price;
    if (variant.original_price?.original_amount) return variant.original_price.original_amount;
    // اگر نبود، همان قیمت عادی را برگردان (یعنی تخفیف ندارد)
    return getVariantPrice(variant);
};


export default function ProductCard({ product }: ProductCardProps) {

  // A. محاسبه وضعیت موجودی (ناموجود بودن)
  const isOutOfStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return true;

    // بررسی: آیا حداقل یک واریانت قابل خرید وجود دارد؟
    const hasPurchasableVariant = product.variants.some((v: any) => {
      if (v.allow_backorder) return true; // اگر پیش‌خرید فعال است -> موجود
      if (!v.manage_inventory) return true; // اگر مدیریت موجودی ندارد -> موجود
      return (v.inventory_quantity || 0) > 0; // اگر تعداد > ۰ -> موجود
    });

    return !hasPurchasableVariant;
  }, [product.variants]);

  // B. پیدا کردن ارزان‌ترین واریانت (برای نمایش "از قیمت ...")
  const cheapestVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return undefined;

    return product.variants.reduce((prev: any, curr: any) => {
      const prevPrice = getVariantPrice(prev);
      const currPrice = getVariantPrice(curr);

      // اگر قبلی قیمت نداشت ولی فعلی دارد، فعلی را بردار
      if (prevPrice === 0 && currPrice > 0) return curr;
      // اگر فعلی قیمت نداشت، قبلی را نگه دار
      if (currPrice === 0 && prevPrice > 0) return prev;
      // هر کدام ارزان‌تر بود
      return prevPrice < currPrice ? prev : curr;
    }, product.variants[0]);
  }, [product.variants]);

  // C. آماده‌سازی اعداد نهایی برای نمایش
  const { currentAmount, originalAmount, currencyCode } = useMemo(() => {
    if (!cheapestVariant) return { currentAmount: 0, originalAmount: 0, currencyCode: "irr" };

    const price = getVariantPrice(cheapestVariant);
    const original = getVariantOriginalPrice(cheapestVariant);
    
    // واحد پولی (پیش‌فرض irr)
    const currency = cheapestVariant.prices?.[0]?.currency_code || "irr";

    return {
      currentAmount: price,
      originalAmount: original,
      currencyCode: currency
    };
  }, [cheapestVariant]);

  // D. محاسبه درصد تخفیف
  const hasDiscount = !isOutOfStock && originalAmount > currentAmount && currentAmount > 0;
  const discountPercentage = hasDiscount
    ? Math.round(((originalAmount - currentAmount) / originalAmount) * 100)
    : 0;

  // E. استخراج رنگ‌ها
  const colorOptions = useMemo(() => {
    const colorOpt = product.options?.find((opt: any) => ["color", "رنگ"].includes(opt.title?.toLowerCase()));
    if (!colorOpt || !colorOpt.values) return [];
    return Array.from(new Set(colorOpt.values.map((v: any) => (typeof v === 'string' ? v : v.value))));
  }, [product.options]);

  const MAX_COLORS_SHOW = 3;
  const extraColorsCount = colorOptions.length - MAX_COLORS_SHOW;
  const productTitle = product.title || "Product";

  return (
    <div className="group flex flex-col w-full h-auto min-h-[420px] relative">
      
      {/* --- بخش تصویر --- */}
      <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-gray-50 border border-transparent group-hover:border-gray-200 transition-colors">
        <Link href={`/products/${product.handle}`} className="block w-full h-full relative">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={productTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 bg-gray-100">
              تصویر ندارد
            </div>
          )}
        </Link>

        {/* بج: تخفیف */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
            {discountPercentage}% تخفیف
          </div>
        )}

        {/* بج: ناموجود (روی عکس هم می‌زنیم که واضح باشد) */}
        {isOutOfStock && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm">
                  ناموجود
              </div>
           </div>
        )}

        {/* دکمه علاقه‌مندی */}
        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton product={product} />
        </div>
      </div>

      {/* --- بخش اطلاعات --- */}
      <div className="flex flex-col mt-4 px-1 gap-2">
        
        {/* عنوان و رنگ‌ها */}
        <div className="flex justify-between items-start gap-2">
          <Link href={`/products/${product.handle}`} className="flex-1">
            <h3 className="text-[14px] font-medium text-gray-800 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors min-h-[44px]">
              {productTitle}
            </h3>
          </Link>

          {/* دایره‌های رنگ */}
          {colorOptions.length > 0 && (
            <div className="flex -space-x-1.5 space-x-reverse pt-1">
              {colorOptions.slice(0, MAX_COLORS_SHOW).map((color: any, index: number) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-gray-100"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {extraColorsCount > 0 && (
                <span className="w-4 h-4 flex items-center justify-center bg-gray-100 text-[8px] rounded-full border border-white text-gray-500">
                  +{extraColorsCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* --- بخش قیمت / وضعیت --- */}
        <div className="flex items-center gap-2 pt-1">
            {isOutOfStock ? (
                // حالت ۱: ناموجود
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    ناموجود
                </span>
            ) : currentAmount > 0 ? (
                // حالت ۲: موجود و دارای قیمت
                <div className="flex flex-col items-start">
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through decoration-red-400/50">
                            {formatPrice(originalAmount, currencyCode)}
                        </span>
                    )}
                    <span className="text-[15px] font-bold text-gray-900">
                        {formatPrice(currentAmount, currencyCode)}
                    </span>
                </div>
            ) : (
                // حالت ۳: موجود ولی بدون قیمت
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                    تماس بگیرید
                </span>
            )}
        </div>

      </div>
    </div>
  );
}