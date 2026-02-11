"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { useRef } from "react";

export default function ProductToolbar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // استفاده از Ref برای ذخیره تایمر (بدون نیاز به پکیج خارجی)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تابع اصلی تغییر URL
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    // همیشه وقتی فیلتر عوض میشه برگرد صفحه ۱
    if (key === "q" || key === "order") {
        params.set("page", "1");
    }

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  // هندل کردن جستجو با تاخیر (Debounce دستی)
  const handleSearchChange = (term: string) => {
    // اگر تایمر قبلی هست، پاکش کن
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    // تایمر جدید تنظیم کن (۵۰۰ میلی‌ثانیه صبر کن بعد بفرست)
    timeoutRef.current = setTimeout(() => {
        updateParams("q", term);
    }, 500);
  };

  // هندل کردن سورت (فوری)
  const handleSortChange = (order: string) => {
    updateParams("order", order);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
      
      {/* جستجو */}
      <div className="relative w-full sm:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="جستجو در نام، هندل و..."
          className="pr-10 h-10"
          defaultValue={searchParams.get("q")?.toString()}
          // اینجا تابع Debounce دستی را صدا می‌زنیم
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* مرتب‌سازی */}
      <div className="flex items-center gap-2 w-full sm:w-auto relative">
        <span className="text-sm text-gray-500 whitespace-nowrap">مرتب‌سازی:</span>
        <div className="relative">
             <select
                className="h-10 border rounded-md text-sm px-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none pr-8 pl-4 w-40"
                onChange={(e) => handleSortChange(e.target.value)}
                defaultValue={searchParams.get("order")?.toString() || "-created_at"}
             >
                <option value="-created_at">جدیدترین</option>
                <option value="created_at">قدیمی‌ترین</option>
                <option value="title">الفبایی (A-Z)</option>
                <option value="-title">الفبایی (Z-A)</option>
             </select>
             <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none"/>
        </div>
      </div>
    </div>
  );
}