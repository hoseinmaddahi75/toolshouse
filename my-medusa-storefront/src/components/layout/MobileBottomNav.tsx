"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Search, Menu, Store } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";

interface MobileBottomNavProps {
  onOpenSearch: () => void;
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenSearch, onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { items: cartItems, toggleCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around h-[65px] px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
      
      {/* ۱. خانه */}
      <Link 
        href="/" 
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          isActive("/") ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <Home className={`w-5 h-5 mb-1 ${isActive("/") ? "text-primary" : ""}`} />
        <span className="text-[11px]">خانه</span>
      </Link>

      {/* ۲. فروشگاه */}
      <Link 
        href="/store" 
        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
          isActive("/store") ? "text-gray-900 font-bold" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        <Store className={`w-5 h-5 mb-1 ${isActive("/store") ? "text-primary" : ""}`} />
        <span className="text-[11px]">فروشگاه</span>
      </Link>

      {/* ۳. جستجو */}
      <button 
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Search className="w-5 h-5 mb-1" />
        <span className="text-[11px]">جستجو</span>
      </button>

      {/* ۴. سبد خرید */}
      <button 
        onClick={toggleCart}
        className="relative flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-900 transition-colors"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 mb-1" />
          {isMounted && cartItems.length > 0 && (
            <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in">
              {cartItems.length}
            </span>
          )}
        </div>
        <span className="text-[11px]">سبد خرید</span>
      </button>

      {/* ۵. منوی همبرگر */}
      <button 
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Menu className="w-5 h-5 mb-1" />
        <span className="text-[11px]">فهرست</span>
      </button>

    </div>
  );
}