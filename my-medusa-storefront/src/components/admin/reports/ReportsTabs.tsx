// src/components/admin/reports/ReportsTabs.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, TicketPercent, PackageSearch } from "lucide-react";

export default function ReportsTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // حفظ کردن فیلتر تاریخ موقع جابجایی بین تب‌ها
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const tabs = [
    { name: "نمای کلی", href: "/dashboard/reports", icon: LayoutDashboard },
    { name: "سفارش‌ها", href: "/dashboard/reports/orders", icon: ShoppingCart },
    { name: "مشتریان", href: "/dashboard/reports/customers", icon: Users },
    { name: "کدهای تخفیف", href: "/dashboard/reports/promotions", icon: TicketPercent },
    { name: "محصولات", href: "/dashboard/reports/products", icon: PackageSearch },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={`${tab.href}${queryString}`}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              isActive 
                ? "bg-white text-blue-700 shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}