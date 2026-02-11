"use client";

import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils"; // یا هر کلاسی که برای merge کلاس‌ها دارید
import { useEffect, useState } from "react";

interface WishlistButtonProps {
  product: any;
  className?: string;
}

export default function WishlistButton({ product, className }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  // برای جلوگیری از ارور Hydration (چون لوکال استوریج سمت سرور نیست)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // در حالت سرور یک دکمه خالی نمایش می‌دهیم تا پرش نکند
    return (
      <button className={cn("p-2 rounded-full bg-white/80 hover:bg-white transition-colors", className)}>
         <Heart className="w-6 h-6 text-gray-900" />
      </button>
    );
  }

  const isLiked = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // جلوگیری از کلیک شدن لینک کارت محصول
        e.stopPropagation();
        toggleItem(product);
      }}
      className={cn(
        "group/heart p-2 rounded-full transition-all duration-200 shadow-sm",
        isLiked ? "bg-red-50 hover:bg-red-100" : "bg-white/80 hover:bg-white",
        className
      )}
      title={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
    >
      <Heart
        className={cn(
          "w-6 h-6 transition-colors duration-200",
          isLiked ? "fill-red-500 text-red-500" : "text-gray-900 group-hover/heart:text-red-500"
        )}
      />
    </button>
  );
}