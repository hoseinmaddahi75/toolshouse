"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Loader2 } from "lucide-react"; 
import { ShareIcon } from "@heroicons/react/24/outline"; 
import { toast } from "sonner";
import { formatPrice } from "@/lib/medusa-client";
import { useCartStore } from "@/lib/store"; 
import clsx from "clsx";
import WishlistButton from "@/components/products/wishlist-button";

interface ProductInfoProps {
  product: any;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  // اگر product.options نال بود، آرایه خالی بگذار
  const productOptions = product.options || [];
  
  const category = product.categories?.[0];
  const addItem = useCartStore((state: any) => state.addItem); 
  const openCart = useCartStore((state: any) => state.openCart);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // 1. مقداردهی اولیه (اصلاح شده)
  useEffect(() => {
    // اگر محصول واریانت دارد اما آپشن ندارد (محصول ساده)، نیازی به ست کردن آپشن نیست
    if (product.variants?.length > 0 && productOptions.length > 0) {
      const defaultVariant = product.variants[0];
      const initialState: Record<string, string> = {};
      
      productOptions.forEach((opt: any, index: number) => {
        // تلاش برای پیدا کردن مقدار آپشن در واریانت پیش‌فرض
        // در مدوسا گاهی values آرایه است، گاهی options
        const variantOption = defaultVariant.options?.[index];
        
        if (variantOption) {
          const val = typeof variantOption === 'object' ? variantOption.value : variantOption;
          initialState[opt.title] = val;
        }
      });
      setSelectedOptions(initialState);
    }
  }, [product]); // وابستگی‌ها ساده شدند

  // 2. پیدا کردن واریانت نهایی (اصلاح حیاتی برای محصولات ساده)
  const selectedVariant = useMemo(() => {
    // 🔴 اصلاح مهم: اگر محصول اصلا آپشن ندارد (محصول ساده)، همان واریانت اول را برگردان
    if (!productOptions || productOptions.length === 0) {
        return product.variants?.[0] || null;
    }

    // اگر آپشن دارد اما هنوز انتخاب نشده
    if (Object.keys(selectedOptions).length === 0) return null;

    return product.variants.find((v: any) => {
      if (!v.options) return false;
      return productOptions.every((pOpt: any, index: number) => {
        const userValue = selectedOptions[pOpt.title];
        const variantOption = v.options[index];
        const variantValue = typeof variantOption === 'object' ? variantOption.value : variantOption;
        return userValue === variantValue;
      });
    });
  }, [selectedOptions, product.variants, productOptions]);

  // 3. محاسبه موجودی دقیق
  const currentStock = useMemo(() => {
    if (!selectedVariant) {
        // اگر هنوز واریانت انتخاب نشده اما محصول ساده است، موجودی کل را نده
        if (productOptions.length === 0 && product.variants?.length > 0) {
            return product.variants[0].inventory_quantity || 0;
        }
        return 0; 
    }
    return selectedVariant.inventory_quantity || 0;
  }, [selectedVariant, product.variants, productOptions]);

  // 4. کنترل سقف تعداد
  useEffect(() => {
    if (selectedVariant && quantity > currentStock) {
      setQuantity(Math.max(1, currentStock));
    }
  }, [selectedVariant, currentStock]);

  const handleOptionSelect = (optionTitle: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionTitle]: value }));
  };

  const handleInc = () => {
    if (quantity < currentStock) setQuantity((q) => q + 1);
    else toast.error("تعداد درخواستی بیشتر از موجودی انبار است");
  };

  const handleDec = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = async () => {
    if (!selectedVariant) return toast.error("محصول در دسترس نیست");
    if (currentStock === 0) return toast.error("محصول ناموجود است");

    setIsAdding(true);
    
    try {
      await addItem(selectedVariant.id, quantity);
      toast.success("به سبد خرید اضافه شد");
      
      if (openCart && typeof openCart === 'function') {
          openCart();
      }
      
    } catch (error) {
      console.error(error);
      toast.error("خطا در افزودن به سبد خرید");
    } finally {
      setIsAdding(false);
    }
  };

  // ------------------------------------------------------------------
  // بخش قیمت
  // ------------------------------------------------------------------
  
  const getVariantPriceObj = (variant: any) => {
    if (!variant?.prices) return null;
    const irrPrice = variant.prices.find((p: any) => p.currency_code === "irr");
    return irrPrice || variant.prices[0];
  };

  const priceObj = selectedVariant 
    ? getVariantPriceObj(selectedVariant) 
    : (product.variants && product.variants.length > 0 ? getVariantPriceObj(product.variants[0]) : null);
  
  const displayPrice = priceObj 
    ? formatPrice(priceObj.amount, priceObj.currency_code) 
    : "---";
  
  // ------------------------------------------------------------------

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `مشاهده محصول ${product.title} در فروشگاه ما`,
          url: url,
        });
      } catch (error) {
        console.log("Sharing failed or canceled", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("لینک محصول کپی شد");
      } catch (err) {
        toast.error("خطا در کپی لینک");
      }
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      
      {/* --- هدر محصول --- */}
      <div className="border-b border-gray-100 pb-6 space-y-4">
        {category && (
          <div className="mb-[10px]"> {/* مارجین منفی برای نزدیک شدن به تیتر */}
            <span className="text-xs font-medium text-gray-500">
              دسته بندی: {" "}
              <span className="text-black hover:text-[#B19276] transition-colors cursor-pointer">
                {category.name}
              </span>
            </span>
          </div>
        )}
        <div className="flex justify-between items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
            {product.title}
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="w-[50px] h-[50px] border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
              title="اشتراک گذاری"
            >
              <ShareIcon className="w-5 h-5" />
            </button>

            <WishlistButton 
              product={product} 
              className="w-[50px] h-[50px] border border-gray-200 bg-white hover:bg-gray-50 rounded-full !shadow-none !p-0 flex items-center justify-center" 
            />
          </div>
        </div>

        {/* قیمت */}
        <div className="flex items-center gap-4">
          <p className="text-3xl font-bold text-black" style={{ fontFamily: "var(--font-sans)" }}>
            {displayPrice}
          </p>
          {currentStock === 0 && (
            <span className="text-sm text-red-500 font-bold bg-red-50 px-2 py-1 rounded">ناموجود</span>
          )}
        </div>
        
        {/* موبایل اکشن */}
        <div className="flex md:hidden items-center gap-3 pt-2">
             <button 
              onClick={handleShare}
              className="w-[40px] h-[40px] border border-gray-200 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
            <WishlistButton 
              product={product} 
              className="w-[40px] h-[40px] border border-gray-200 bg-white hover:bg-gray-50 rounded-full !shadow-none !p-0 flex items-center justify-center" 
            />
        </div>

      </div>

      <div 
        className="text-gray-600 leading-8 text-justify text-sm [&>p]:mb-2"
        dangerouslySetInnerHTML={{ __html: product.description || "" }}
      />
      
      {/* انتخاب‌گرها - فقط اگر آپشن واقعی وجود داشته باشد */}
      {productOptions.length > 0 && (
        <div className="space-y-6">
            {productOptions.map((option: any) => {
            // فیلتر کردن آپشن‌های دیفالت مدوسا که نباید نمایش داده شوند
            if (option.title === "Default Option") return null;

            return (
                <div key={option.id || option.title} className="space-y-3">
                <span className="font-bold text-sm text-gray-900">
                    انتخاب {option.title}: <span className="text-gray-500 font-normal">{selectedOptions[option.title]}</span>
                </span>
                <div className="flex flex-wrap gap-3">
                    {option.values.map((val: any) => {
                    const valueStr = typeof val === 'object' ? val.value : val;
                    const isSelected = selectedOptions[option.title] === valueStr;
                    return (
                        <button
                        key={valueStr}
                        onClick={() => handleOptionSelect(option.title, valueStr)}
                        className={clsx(
                            "min-w-[3rem] h-10 px-4 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                            isSelected ? "bg-black text-white border-2 border-black" : "bg-white text-gray-700 border border-gray-200 hover:border-black"
                        )}
                        >
                        {valueStr}
                        </button>
                    );
                    })}
                </div>
                </div>
            );
            })}
        </div>
      )}

      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">وضعیت انبار:</span>
          {currentStock > 0 ? (
            <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded text-xs">
              {currentStock} عدد موجود
            </span>
          ) : (
            <span className="text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded text-xs">ناموجود</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-1 w-full sm:w-36 h-12">
            <button onClick={handleDec} disabled={quantity <= 1 || currentStock === 0} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30">
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-mono text-lg font-medium w-8 text-center">{quantity}</span>
            <button onClick={handleInc} disabled={quantity >= currentStock || currentStock === 0} className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant || currentStock === 0 || isAdding}
            className="flex-1 h-12 rounded-xl text-base shadow-sm hover:shadow-md transition-all gap-2 bg-black text-white hover:bg-gray-800"
          >
            {isAdding ? (
               <><Loader2 className="w-5 h-5 animate-spin" /> در حال افزودن...</>
            ) : !selectedVariant ? (
               // اگر محصول ساده باشد، selectedVariant پر است، پس این پیام نمایش داده نمی‌شود
               "گزینه‌ها را انتخاب کنید"
            ) : currentStock === 0 ? (
               "موجود شد خبرم کن"
            ) : (
               <>
                 <ShoppingBag className="w-5 h-5" />
                 افزودن به سبد خرید
               </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}