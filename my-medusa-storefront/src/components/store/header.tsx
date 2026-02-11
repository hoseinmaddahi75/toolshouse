"use client";

import Link from "next/link";
import { ShoppingBag, Search, Store } from "lucide-react";

export default function StoreHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2">
          <Store className="h-8 w-8 text-blue-600" />
          <span className="font-bold text-xl tracking-tight text-gray-900">فروشگاه مدرن</span>
        </Link>

        {/* منو وسط (اختیاری) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">خانه</Link>
          <Link href="/products" className="hover:text-blue-600 transition-colors">محصولات</Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">درباره ما</Link>
        </nav>

        {/* سمت چپ: سبد خرید و سرچ */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <Search className="h-5 w-5" />
          </button>
          
          <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 group">
            <ShoppingBag className="h-5 w-5 group-hover:text-blue-600" />
            {/* بج تعداد آیتم (فعلاً استاتیک) */}
            <span className="absolute top-0 right-0 h-4 w-4 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              0
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}