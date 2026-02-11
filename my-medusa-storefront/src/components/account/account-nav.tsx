"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, Package, MapPin, LayoutDashboard 
} from "lucide-react";
import { cn } from "@/lib/utils"; 
import LogoutButton from "@/components/store/logout-button"; // این همان دکمه جدیدی است که ساختیم

const navItems = [
  { href: "/account", label: "خلاصه وضعیت", icon: LayoutDashboard },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/profile", label: "اطلاعات حساب", icon: User },
];

export default function AccountNav({ customer }: { customer: any }) {
  const pathname = usePathname();

  return (
    <div className="w-full md:w-64 flex flex-col gap-6">
      {/* کارت پروفایل */}
      <div className="flex items-center gap-3 px-4 py-4 bg-white border rounded-xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border">
            <User className="w-6 h-6 text-gray-500"/>
        </div>
        <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{customer?.first_name} {customer?.last_name}</p>
            <p className="text-xs text-gray-500 truncate dir-ltr">{customer?.email}</p>
        </div>
      </div>

      {/* منوی اصلی */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-black text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-black"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* دکمه خروج */}
      <div className="mt-auto border-t pt-4">
        <div className="px-4">
            <LogoutButton /> 
        </div>
      </div>
    </div>
  );
}