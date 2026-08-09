"use client";

import * as React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { Menu, ChevronLeft, ChevronDown } from "lucide-react";

export function MegaMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0]);
  
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  return (
    <div 
      dir="rtl" 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* دکمه دسته‌بندی همراه با فلش متحرک */}
      <button
        className="flex items-center gap-1.5 bg-transparent hover:bg-gray-100 font-bold text-[14px] text-[#0B0C17] px-3 py-2 rounded-lg transition-colors cursor-pointer"
      >
        <Menu className="w-4 h-4" />
        <span>دسته‌بندی کالاها</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* باکس مگامنو */}
      {isOpen && (
        <div className="fixed left-1/2 -translate-x-1/2 top-[90px] w-[850px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 flex animate-in fade-in zoom-in-95 duration-200">
          
          {/* ستون راست: دسته‌های اصلی */}
          <div className="w-1/3 border-l border-gray-100 flex flex-col pl-2 py-2">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.handle}
                onMouseEnter={() => setActiveCategory(cat)}
                className={`flex justify-between items-center p-3 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                  activeCategory.handle === cat.handle 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{cat.name}</span>
                <ChevronLeft className={`w-4 h-4 ${activeCategory.handle === cat.handle ? "text-blue-500" : "text-gray-300"}`} />
              </div>
            ))}
          </div>

          {/* ستون چپ: زیردسته‌ها */}
          <div className="w-2/3 p-6 bg-gray-50/30 overflow-y-auto max-h-[500px]">
            <h3 className="text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              زیردسته‌های {activeCategory.name}
            </h3>
            
            <div className="grid grid-cols-3 gap-y-4 gap-x-6">
              <Link 
                href={`/categories/${activeCategory.handle}`} 
                onClick={() => setIsOpen(false)}
                className="col-span-3 text-sm font-bold text-blue-600 hover:underline mb-2"
              >
                مشاهده همه در {activeCategory.name} &larr;
              </Link>

              {activeCategory.children?.map((child) => (
                <Link
                  key={child.handle}
                  href={`/categories/${child.handle}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-600 hover:text-blue-600 hover:font-medium transition-colors line-clamp-1"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}