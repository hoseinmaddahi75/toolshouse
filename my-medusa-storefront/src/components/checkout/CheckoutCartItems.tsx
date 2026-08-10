"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, Loader2, PackageOpen } from "lucide-react";
import { updateItemQuantityAction } from "@/app/checkout/actions";
import { toast } from "sonner";

export default function CheckoutCartItems({ cart, onCartUpdate }: { cart: any, onCartUpdate: (newCart: any) => void }) {
  // ذخیره ID آیتمی که در حال آپدیت شدن است تا روی آن لودینگ نشان دهیم
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const handleUpdateQuantity = async (lineId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    
    // جلوگیری از کلیک‌های تکراری و اسپم توسط کاربر
    if (updatingItemId) return;

    setUpdatingItemId(lineId);
    
    try {
      // فراخوانی اکشن سرور
      const res = await updateItemQuantityAction(cart.id, lineId, newQuantity);
      
      if (res.success && res.cart) {
        onCartUpdate(res.cart); // 💡 ارسال سبد جدید به کامپوننت پدر (Checkout) تا قیمت‌ها آپدیت شوند
      } else {
        // 💡 هندل کردن هوشمندانه ارورِ موجودی انبار که سرور مدوسا برمی‌گرداند
        const errorMessage = res.message || "";
        if (errorMessage.includes("insufficient_inventory") || errorMessage.includes("required inventory")) {
            toast.error("موجودی این کالا در انبار کافی نیست!");
        } else {
            toast.error("خطا در به‌روزرسانی سبد خرید.");
        }
      }
    } catch (error) {
      toast.error("خطای شبکه در ارتباط با سرور");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // اگر سبد خرید خالی بود این حالت زیبا نمایش داده می‌شود
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
        <PackageOpen className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">سبد خرید شما خالی است</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
        سبد خرید شما
        <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2.5 rounded-full font-medium">
          {cart.items.length} کالا
        </span>
      </h3>
      
      <div className="divide-y divide-gray-100 border rounded-2xl overflow-hidden bg-white shadow-sm">
        {cart.items.map((item: any) => {
          // 💡 پیدا کردن اتوماتیک هندل از تمام مسیرهای ممکن در مدوسا
          const handle = item.product_handle || item.variant?.product?.handle || item.product?.handle;
          const productLink = handle ? `/products/${handle}` : "#";
          
          // استفاده مستقیم از قیمت واحد مدوسا (ریال)
          const priceInRial = item.unit_price || 0;

          return (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 items-center relative hover:bg-gray-50/50 transition-colors">
              
              {/* تصویر محصول */}
              <Link 
                href={productLink}
                className="w-24 h-24 relative bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer block"
              >
                {item.thumbnail ? (
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                     <PackageOpen className="w-5 h-5 opacity-50" />
                     بدون عکس
                  </div>
                )}
              </Link>

              {/* اطلاعات محصول */}
              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-right w-full">
                <Link 
                  href={productLink}
                  className="hover:text-blue-600 transition-colors"
                >
                  <h4 className="font-bold text-gray-800 line-clamp-2 leading-relaxed">{item.title}</h4>
                </Link>
                
                {/* فقط اگر واریانت مقداری غیر از پیش‌فرض داشت نمایش داده شود */}
                {item.variant?.title && item.variant.title !== "Default Variant" && (
                    <p className="text-xs font-medium text-gray-500 mt-1.5 bg-gray-100 px-2 py-1 rounded-md inline-block">
                        {item.variant.title}
                    </p>
                )}
                
                <div className="mt-3 font-black text-blue-600 text-lg flex items-center gap-1">
                  {new Intl.NumberFormat("fa-IR").format(priceInRial)}
                  <span className="text-xs font-medium text-gray-500">ریال</span>
                </div>
              </div>

              {/* کنترل‌گر تعداد (+ و -) */}
              <div className="flex items-center bg-gray-50 border rounded-xl overflow-hidden h-10 shrink-0 shadow-sm mt-3 sm:mt-0">
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                  disabled={updatingItemId === item.id}
                  className="w-10 h-full flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 text-gray-600 disabled:opacity-50 transition-colors"
                  title="افزایش تعداد"
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                <div className="w-12 h-full flex items-center justify-center bg-white font-bold text-sm border-x text-gray-800">
                  {updatingItemId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  ) : (
                    new Intl.NumberFormat("fa-IR").format(item.quantity)
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                  disabled={updatingItemId === item.id}
                  className="w-10 h-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-gray-600 disabled:opacity-50 transition-colors"
                  title={item.quantity <= 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
                >
                  {item.quantity <= 1 ? (
                     <Trash2 className="w-4 h-4 text-red-500" />
                  ) : (
                     <Minus className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}