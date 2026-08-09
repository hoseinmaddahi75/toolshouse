"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import CartDrawer from "@/components/modules/cart/CartDrawer";
import { useEffect, useState } from "react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Heart, X, Menu } from "lucide-react"; 
import SearchModal from "@/components/search/search-modal";

// 💡 ایمپورت‌های جدید برای مگامنو، دیتا و آکاردئون موبایل
import { MegaMenu } from "@/components/layout/MegaMenu";
import { CATEGORIES } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MENU_ITEMS = [
  { title: "خانه", href: "/" },
  { title: "فروشگاه", href: "/store" },
  { title: "درباره ما", href: "/about" },
  { title: "تماس با ما", href: "/contact" },
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
        
        {/* --- بخش راست: لوگو و همبرگر --- */}
        <div className="flex items-center gap-4 md:mr-[48px]">
          <button 
            className="md:hidden p-2 -mr-2 text-[#0B0C17]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
             <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={98} height={42} className="w-[80px] h-auto md:w-[160px] md:h-[62px] object-cover rounded-md md:rounded-2xl" priority />
          </Link>
        </div>

        {/* --- بخش وسط: منو دسکتاپ --- */}
        <nav className="hidden md:flex items-center justify-center gap-[16px] px-[16px] h-[40px] bg-[#FAFAFA] rounded-full border border-[#E4E4E7]">
          {/* مگامنو دقیقاً در همینجا رندر می‌شود */}
          <MegaMenu />
          
          <div className="w-[1px] h-4 bg-gray-300 mx-1"></div> {/* خط جداکننده */}
          
          {MENU_ITEMS.map((item, index) => (
            <Link key={index} href={item.href} className="text-[14px] font-medium text-[#0B0C17] hover:text-[#0B0C17]/70 transition-colors">
              {item.title}
            </Link>
          ))}
        </nav>

        {/* --- بخش چپ: آیکون‌ها --- */}
        <div className="md:ml-[48px] flex items-center gap-[4px] md:gap-[8px]">
          <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors">
            <Image src="/icons/search.svg" alt="Search" width={20} height={20} className="w-[20px] h-[20px]" />
          </button>

          <button onClick={toggleCart} className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors">
            <Image src="/icons/cart.svg" alt="Cart" width={20} height={20} className="w-[20px] h-[20px]" />
            {isMounted && cartItems.length > 0 && (
              <span className="absolute top-[2px] right-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartItems.length}
              </span>
            )}
          </button>

          <Link href="/wishlist" className="relative flex items-center justify-center w-[40px] h-[40px] rounded-full hover:bg-gray-100 transition-colors group">
             <Heart className="w-[20px] h-[20px] text-gray-900 group-hover:text-red-500 transition-colors" />
             {isMounted && wishlistItems.length > 0 && (
                <span className="absolute top-[2px] right-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in">
                   {wishlistItems.length}
                </span>
             )}
          </Link>

          <Link href="/account">
             <IconButton icon="/icons/user.svg" alt="Profile" />
          </Link>
        </div>
      </header>

      {/* --- منوی موبایل (Mobile Drawer) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="relative bg-white w-[300px] h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b">
              <span className="font-bold text-lg text-gray-800">فهرست</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* محتوای اسکرول‌شونده منوی موبایل */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {/* لینک‌های اصلی */}
                <nav className="flex flex-col gap-2 mb-6">
                {MENU_ITEMS.map((item, index) => (
                    <Link 
                    key={index} 
                    href={item.href} 
                    className="text-gray-800 font-bold text-lg hover:text-blue-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                    >
                    {item.title}
                    </Link>
                ))}
                </nav>
                
                {/* 💡 آکاردئون دسته‌بندی‌ها */}
                <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">دسته‌بندی کالاها</p>
                <Accordion type="single" collapsible className="w-full">
                    {CATEGORIES.map((cat) => (
                    <AccordionItem value={cat.handle} key={cat.handle} className="border-b-0">
                        <AccordionTrigger className="hover:no-underline py-3 text-base font-bold text-gray-700 hover:text-blue-600 text-right">
                        {cat.name}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1">
                        <div className="flex flex-col space-y-3 pl-4 border-r-2 border-gray-100 mr-2">
                            <Link 
                            href={`/categories/${cat.handle}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-sm font-bold text-blue-600 mb-1"
                            >
                            مشاهده همه محصولات
                            </Link>
                            {cat.children?.map((child) => (
                            <Link
                                key={child.handle}
                                href={`/categories/${child.handle}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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
            
            <div className="border-t p-4 bg-gray-50 text-sm text-gray-500 text-center">
             فروشگاه آنلاین خانه ابزار
            </div>
          </div>
        </div>
      )}

      {/* مودال‌ها */}
      <CartDrawer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
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