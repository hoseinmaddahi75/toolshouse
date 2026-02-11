"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  User, Package, MapPin, LayoutDashboard, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/store/logout-button";

const navItems = [
  { href: "/account", label: "خلاصه وضعیت", icon: LayoutDashboard },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
];

export default function MobileAccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // پیدا کردن نام صفحه فعلی
  const activeItem = navItems.find((item) => item.href === pathname) || navItems[0];
  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden mb-6 relative z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-gray-900"
      >
        <div className="flex items-center gap-3">
            <ActiveIcon className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-sm">{activeItem.label}</span>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <nav className="flex flex-col">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <button
                            key={item.href}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm text-right transition-colors border-b last:border-0 border-gray-50",
                                isActive ? "bg-gray-50 font-bold text-black" : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? "text-black" : "text-gray-400")} />
                            {item.label}
                        </button>
                    );
                })}
                <div className="p-2 bg-gray-50 border-t">
                    <LogoutButton />
                </div>
            </nav>
        </div>
      )}
    </div>
  );
}