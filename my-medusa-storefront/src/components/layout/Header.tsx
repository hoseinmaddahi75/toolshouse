"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCartStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart, X } from "lucide-react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { CATEGORIES } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CartDrawer = dynamic(() => import("@/components/modules/cart/CartDrawer"), { ssr: false });
const SearchModal = dynamic(() => import("@/components/search/search-modal"), { ssr: false });

const MENU_ITEMS = [
  { title: "خانه", href: "/" },
  { title: "فروشگاه", href: "/store" },
  { title: "درباره ما", href: "/about" },
  { title: "تماس با ما", href: "/contact" },
  { title: "وبلاگ", href: "/blog" },
];

export default function Header() {
  const { items: cartItems, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-[90px] bg-background border-b border-[#E4E4E7] flex items-center justify-between px-4 md:px-0 transition-all">
        <div className="flex items-center md:mr-[48px]">
          <Link href="/" aria-label="صفحه اصلی">
            <Image src="/images/logo.png" alt="Logo" width={98} height={42} className="w-[80px] h-auto md:w-[160px] md:h-[62px] object-cover rounded-md md:rounded-2xl" priority />
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-[16px] px-[16px] h-[40px] bg-[#FAFAFA] rounded-full border border-[#E4E4E7]">
          <MegaMenu />
          
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
          
          {MENU_ITEMS.map((item, index) => (
            <Link key={index} href={item.href} className="text-[14px] font-medium text-[#0B0C17] hover:text-[#0B0C17]/70 transition-colors">
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="md:ml-[48px] flex items-center gap-[4px] md:gap-[8px]">
          <button onClick={() => setIsSearchOpen(true)} aria-label="جستجو" className="hidden md:flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors">
            <Image src="/icons/search.svg" alt="Search" width={20} height={20} className="w-[20px] h-[20px]" />
          </button>

          <button onClick={toggleCart} aria-label="سبد خرید" className="hidden md:flex relative items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors">
            <Image src="/icons/cart.svg" alt="Cart" width={20} height={20} className="w-[20px] h-[20px]" />
            {isMounted && cartItems.length > 0 && (
              <span className="absolute top-[2px] right-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>

          <Link href="/wishlist" aria-label="مشاهده علاقه‌مندی‌ها" className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors group">
             <Heart className="w-[20px] h-[20px] text-gray-900 group-hover:text-red-500 transition-colors" />
             {isMounted && wishlistItems.length > 0 && (
                <span className="absolute top-[2px] right-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in">
                   {wishlistItems.length}
                </span>
             )}
          </Link>

          <Link href="/account" aria-label="حساب کاربری">
             <IconButton icon="/icons/user.svg" alt="Profile" />
          </Link>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="relative bg-white w-[300px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <span className="font-bold text-lg text-gray-800">فهرست سایت</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="بستن منو" className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
                <nav className="flex flex-col gap-2 mb-6">
                {MENU_ITEMS.map((item, index) => (
                    <Link 
                      key={index} 
                      href={item.href} 
                      className="font-bold text-[15px] text-gray-700 hover:text-blue-600 transition-colors py-2.5 border-b border-gray-50 last:border-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                ))}
                </nav>
                
                <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-gray-400 mb-3 tracking-wider">دسته‌بندی ابزارآلات</p>
                <Accordion type="single" collapsible className="w-full">
                    {CATEGORIES.map((cat) => (
                    <AccordionItem value={cat.handle} key={cat.handle} className="border-b border-gray-50">
                        <AccordionTrigger className="hover:no-underline py-3 text-[15px] font-bold text-gray-800 hover:text-blue-600 text-right">
                          {cat.name}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1">
                        <div className="flex flex-col space-y-3 pl-4 border-r-2 border-blue-100 mr-2">
                            <Link 
                              href={`/categories/${cat.handle}`} 
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="text-[13px] font-bold text-blue-600 mb-1"
                            >
                              مشاهده همه محصولات
                            </Link>
                            {cat.children?.map((child) => (
                            <Link 
                              key={child.handle} 
                              href={`/categories/${child.handle}`} 
                              onClick={() => setIsMobileMenuOpen(false)} 
                              className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors relative before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-gray-300 before:absolute before:-right-[13px] before:top-1.5"
                            >
                                {child.name}
                            </Link>
                            ))}
                        </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50 text-center">
               <span className="text-xs font-bold text-gray-400">خانه ابزار - مرجع تخصصی ابزارآلات</span>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileBottomNav 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />
    </>
  );
}

function IconButton({ icon, alt }: { icon: string; alt: string }) {
  return (
    <button className="flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors" aria-label={alt}>
      <Image src={icon} alt={alt} width={20} height={20} className="w-[20px] h-[20px]" />
    </button>
  );
}