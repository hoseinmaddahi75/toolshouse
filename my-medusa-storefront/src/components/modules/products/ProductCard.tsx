"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/medusa-client";
import { useMemo } from "react";
import WishlistButton from "@/components/products/wishlist-button";

interface ProductCardProps {
  product: any;
}

/**
 * Converts a given color name to its corresponding hex color code.
 * Falls back to the original string if no match is found.
 */
const getColorHex = (colorName: string): string => {
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

/**
 * استخراج قیمت فعلی/تخفیف‌خورده منطبق با ساختار Medusa v2
 */
const getVariantPrice = (variant: any): number => {
  if (!variant) return 0;

  // بررسی آبجکت calculated_price در V2
  if (variant.calculated_price && typeof variant.calculated_price === "object") {
    return variant.calculated_price.calculated_amount ?? 0;
  }
  
  if (typeof variant.calculated_price === "number") {
    return variant.calculated_price;
  }

  // فال‌بک به آرایه قیمت‌های عادی
  const prices = variant.prices || variant.price_set?.prices || [];
  if (prices.length > 0) {
    const irrPrice = prices.find((p: any) => 
      p.currency_code && ["irr", "irt"].includes(p.currency_code.toLowerCase())
    );
    if (irrPrice) return irrPrice.amount;

    const anyPrice = prices.find((p: any) => p.amount > 0);
    if (anyPrice) return anyPrice.amount;
  }

  return 0;
};

/**
 * استخراج قیمت اصلی/پایه منطبق با ساختار Medusa v2
 */
const getVariantOriginalPrice = (variant: any): number => {
  if (!variant) return 0;

  // در مدوسا v2 قیمت اصلی هم داخل آبجکت calculated_price قرار دارد
  if (variant.calculated_price && typeof variant.calculated_price === "object") {
    return variant.calculated_price.original_amount ?? getVariantPrice(variant);
  }
  
  if (typeof variant.original_price === "number") {
    return variant.original_price;
  }

  return getVariantPrice(variant);
};

export default function ProductCard({ product }: ProductCardProps) {

  /**
   * Determines if the product is completely out of stock based on its variants.
   */
  const isOutOfStock = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return true;

    const hasPurchasableVariant = product.variants.some((v: any) => {
      if (v.allow_backorder) return true; 
      if (!v.manage_inventory) return true; 
      return (v.inventory_quantity || 0) > 0; 
    });

    return !hasPurchasableVariant;
  }, [product.variants]);

  /**
   * Identifies the variant with the lowest price to display "Starting from..."
   */
  const cheapestVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return undefined;

    return product.variants.reduce((prev: any, curr: any) => {
      const prevPrice = getVariantPrice(prev);
      const currPrice = getVariantPrice(curr);

      if (prevPrice === 0 && currPrice > 0) return curr;
      if (currPrice === 0 && prevPrice > 0) return prev;
      
      return prevPrice < currPrice ? prev : curr;
    }, product.variants[0]);
  }, [product.variants]);

  /**
   * Prepares the final pricing values and currency code for the component.
   */
  const { currentAmount, originalAmount, currencyCode } = useMemo(() => {
    if (!cheapestVariant) return { currentAmount: 0, originalAmount: 0, currencyCode: "irr" };

    const price = getVariantPrice(cheapestVariant);
    const original = getVariantOriginalPrice(cheapestVariant);
    const pricesArray = cheapestVariant.prices || cheapestVariant.price_set?.prices || [];
    const currency = pricesArray[0]?.currency_code || "irr";

    return {
      currentAmount: price,
      originalAmount: original,
      currencyCode: currency
    };
  }, [cheapestVariant]);

  // فقط زمانی تخفیف را نشان بده که قیمت اصلی بالاتر از قیمت فعلی باشد
  const hasDiscount = !isOutOfStock && originalAmount > currentAmount && currentAmount > 0;
  
  const discountPercentage = hasDiscount
    ? Math.round(((originalAmount - currentAmount) / originalAmount) * 100)
    : 0;

  /**
   * Extracts unique color options from the product data.
   */
  const colorOptions = useMemo(() => {
    const colorOpt = product.options?.find((opt: any) => 
      ["color", "رنگ"].includes(opt.title?.toLowerCase())
    );
    if (!colorOpt || !colorOpt.values) return [];
    
    return Array.from(new Set(colorOpt.values.map((v: any) => 
      typeof v === 'string' ? v : v.value
    )));
  }, [product.options]);

  const MAX_COLORS_SHOW = 3;
  const extraColorsCount = colorOptions.length - MAX_COLORS_SHOW;
  const productTitle = product.title || "Product";

  return (
    <div className="group flex flex-col w-full h-auto min-h-[420px] relative">
      
      <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-gray-50 border border-transparent group-hover:border-gray-200 transition-colors">
        <Link href={`/products/${product.handle}`} className="block w-full h-full relative">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={productTitle}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                isOutOfStock ? "grayscale opacity-60" : ""
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 bg-gray-100">
              تصویر ندارد
            </div>
          )}
        </Link>

        {/* لیبل تخفیف با دیزاین جدید (بالا سمت چپ، پس‌زمینه سبز روشن، متن سبز پررنگ) */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-green-100/95 backdrop-blur-sm text-green-800 px-3 py-1.5 rounded-lg text-sm font-bold z-10 shadow-sm border border-green-200/50">
            {discountPercentage}٪ تخفیف
          </div>
        )}

        {isOutOfStock && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm">
                  ناموجود
              </div>
           </div>
        )}

        <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton product={product} />
        </div>
      </div>

      <div className="flex flex-col mt-4 px-1 gap-2">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/products/${product.handle}`} className="flex-1">
            <h3 className="text-[14px] font-medium text-gray-800 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors min-h-[44px]">
              {productTitle}
            </h3>
          </Link>

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

        <div className="flex items-center pt-2">
            {isOutOfStock ? (
                <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    ناموجود
                </span>
            ) : currentAmount > 0 ? (
                <div className="flex flex-col items-start gap-0.5">
                    {/* نمایش قیمت اصلی (خط خورده) در صورت وجود تخفیف */}
                    {hasDiscount && (
                        <span className="text-xs font-medium text-gray-400 line-through decoration-gray-400/70">
                            {formatPrice(originalAmount, currencyCode)}
                        </span>
                    )}
                    {/* نمایش قیمت نهایی */}
                    <span className={`text-[16px] font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatPrice(currentAmount, currencyCode)}
                    </span>
                </div>
            ) : (
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                    تماس بگیرید
                </span>
            )}
        </div>
      </div>
    </div>
  );
}