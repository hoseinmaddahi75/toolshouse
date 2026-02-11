"use client";

import { useWishlistStore } from "@/lib/wishlist-store";
import ProductCard from "@/components/modules/products/ProductCard"; // مسیر ایمپورت کارت خود را چک کنید
import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // جلوگیری از hydration mismatch

  return (
    <div className="container mx-auto px-4 py-12 min-h-[60vh]">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          لیست علاقه‌مندی‌ها
        </h1>
        <p className="text-gray-500 mt-2">
          {items.length} محصول ذخیره شده
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <p className="text-lg text-gray-600 mb-6">لیست علاقه‌مندی‌های شما خالی است.</p>
            <Link 
                href="/store" 
                className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
                مشاهده محصولات
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}