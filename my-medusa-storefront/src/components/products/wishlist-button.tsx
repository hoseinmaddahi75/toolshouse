"use client";

import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface WishlistButtonProps {
  product: any;
  className?: string;
}

export default function WishlistButton({ product, className }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        aria-label="بارگذاری علاقه‌مندی"
        className={cn("p-2 rounded-full bg-white/80 shadow-sm", className)}
      >
         <Heart className="w-6 h-6 text-gray-900" />
      </button>
    );
  }

  const isLiked = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
      }}
      // aria-label به گوگل و ابزارهای نابینایان می‌فهماند این دکمه چیست
      aria-label={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      title={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={cn(
        // جایگزینی transition-all با transition-colors و افزودن افکت scale
        "group/heart p-2 rounded-full transition-colors transform hover:scale-110 active:scale-95 duration-200 shadow-sm",
        isLiked ? "bg-red-50 hover:bg-red-100" : "bg-white/80 hover:bg-white",
        className
      )}
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