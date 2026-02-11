"use client";

import { ChevronUpIcon } from "@heroicons/react/24/outline";

const BackToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    // تغییر right-0 به left-0 برای قرارگیری در سمت چپ ستون
    <div className="hidden lg:flex absolute left-0 top-0 h-full w-[1px] bg-[#2a2a2a] items-start justify-center">
      {/* دکمه مستطیلی */}
      <button
        onClick={scrollToTop}
        // استفاده از -translate-x-1/2 برای قرار گرفتن دقیقاً روی خط
        className="mt-8 w-[25px] h-[70px] bg-[#6D6D74] rounded-[50px] left-10 flex items-center justify-center hover:bg-[#5a5a60] transition-colors shadow-lg z-10  cursor-pointer group"
        title="بازگشت به بالا"
      >
        {/* آیکون فلش */}
        <ChevronUpIcon className="w-4 h-4 text-white stroke-[3] group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default BackToTop;