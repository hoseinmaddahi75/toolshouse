"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MobileFilterProps {
  categories: any[];
}

export default function MobileFilter({ categories }: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategories = searchParams.getAll("category_id");

  const handleFilterChange = (id: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) params.append("category_id", id);
    else params.delete("category_id", id);
    
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* دکمه تریگر (فقط در موبایل دیده می‌شود) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Filter className="w-4 h-4" />
        فیلترها
      </button>

      {/* پنل باز شونده (Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 md:max-w-sm md:mr-auto md:border-r">
          
          {/* هدر پنل */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-lg">فیلتر محصولات</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* محتوای اسکرول‌خور */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* بخش دسته‌بندی‌ها */}
            <div>
                <h3 className="font-bold text-sm mb-3">دسته‌بندی‌ها</h3>
                <div className="space-y-3">
                    {categories?.map((c) => (
                        <div key={c.id} className="flex items-center gap-3">
                            <Checkbox
                                id={`mobile-${c.id}`}
                                checked={selectedCategories.includes(c.id)}
                                onCheckedChange={(checked) => handleFilterChange(c.id, checked as boolean)}
                                className="w-5 h-5 border-gray-300"
                            />
                            <Label htmlFor={`mobile-${c.id}`} className="text-base font-medium">
                                {c.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* می‌توانید بخش‌های سایز و رنگ را هم اینجا اضافه کنید */}

          </div>

          {/* فوتر پنل (دکمه مشاهده نتایج) */}
          <div className="p-4 border-t bg-gray-50">
            <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-black text-white font-bold rounded-xl"
            >
                مشاهده نتایج
            </button>
          </div>

        </div>
      )}
    </>
  );
}