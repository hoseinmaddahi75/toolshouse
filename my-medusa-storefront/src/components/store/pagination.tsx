"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils"; // اگر lib/utils ندارید، این را بسازید یا کلس‌ها را دستی بنویسید

type PaginationProps = {
  page: number;
  totalPages: number;
};

export default function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // تابع تغییر صفحه
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // تولید اعداد صفحه (با منطق سه نقطه)
  const generatePages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-16 pb-10">
      {/* دکمه قبلی */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "flex h-10 w-10 items-center justify-center bg-[#F7F7F8] rounded text-[#6D6D74] transition-all",
          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-200"
        )}
      >
        <ChevronRight className="h-5 w-5" /> {/* چون راست‌چین هستیم، آیکون برعکس است */}
      </button>

      {/* شماره‌ها */}
      {generatePages().map((p, i) => (
        <div key={i}>
          {p === "..." ? (
            <span className="flex h-10 w-10 items-center justify-center text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              onClick={() => handlePageChange(p as number)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded text-sm font-medium transition-all",
                page === p
                  ? "bg-black text-white shadow-md"
                  : "bg-[#F7F7F8] text-[#6D6D74] hover:bg-gray-200"
              )}
            >
              {p}
            </button>
          )}
        </div>
      ))}

      {/* دکمه بعدی */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "flex h-10 w-10 items-center justify-center bg-[#F7F7F8] rounded text-[#6D6D74] transition-all",
          page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-gray-200"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}