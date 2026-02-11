"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation"; // 👈 usePathname اضافه شد
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ✅ تعریف تایپ دقیق برای دسته‌بندی
interface Category {
  id: string;
  name: string;
  handle: string;
  // اگر دسته‌بندی‌های تودرتو دارید، این فیلد بعدا به کار میاد:
  category_children?: Category[]; 
}

interface FilterSidebarProps {
  categories: Category[];
}

export default function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // 👈 دریافت مسیر فعلی (مثلا /store)

  // دریافت دسته‌بندی‌های انتخاب شده به صورت آرایه
  const selectedCategories = searchParams.getAll("category_id");

  const handleFilterChange = (id: string, checked: boolean) => {
    // کپی کردن پارامترهای فعلی URL
    const params = new URLSearchParams(searchParams.toString());

    if (checked) {
      // اگر تیک خورد، اضافه کن
      params.append("category_id", id);
    } else {
      // اگر تیک برداشته شد، حذف کن
      params.delete("category_id", id);
    }

    // وقتی فیلتر عوض میشه، بهتره برگردیم صفحه ۱
    params.set("page", "1");

    // 👈 استفاده از pathname برای حفظ آدرس صفحه
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [isOpen, setIsOpen] = useState(true);

  // تابع کمکی برای پاک کردن همه فیلترها
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category_id");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <aside className="hidden lg:block w-[280px] flex-shrink-0">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 sticky top-24">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">فیلترها</h3>
          {selectedCategories.length > 0 && (
             <button 
                onClick={clearFilters} // 👈 استفاده از تابع جدید
                className="text-xs text-red-500 hover:underline"
             >
                حذف همه
             </button>
          )}
        </div>

        <div className="flex flex-col divide-y divide-gray-100">
          
          <div className="border-b border-gray-100 last:border-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between py-4 text-sm font-bold text-gray-900 hover:text-gray-600 transition-colors"
            >
              دسته‌بندی‌ها
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0")}>
              <div className="overflow-hidden">
                <div className="space-y-3 pt-1 pl-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                  
                  {categories?.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <Checkbox
                        id={c.id}
                        // چک کردن اینکه آیا آیدی این دسته در URL هست یا نه
                        checked={selectedCategories.includes(c.id)}
                        onCheckedChange={(checked) => handleFilterChange(c.id, checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black w-4 h-4 rounded-[4px]"
                      />
                      <Label htmlFor={c.id} className="text-[13px] text-gray-600 cursor-pointer hover:text-black transition-colors font-medium select-none">
                        {c.name}
                      </Label>
                    </div>
                  ))}

                  {categories?.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">دسته‌بندی یافت نشد.</p>
                  )}

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </aside>
  );
}