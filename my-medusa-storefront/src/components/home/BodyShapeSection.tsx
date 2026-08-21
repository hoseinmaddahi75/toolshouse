"use client";

import Image from "next/image";
import Link from "next/link";

const BRAND_IMAGES = [
  "/images/shape-1.jpg",
  "/images/shape-2.jpg",
  "/images/shape-3.jpg",
  "/images/shape-4.jpg",
  "/images/shape-5.jpg",
  "/images/shape-6.jpg",
];

export default function BodyShapeSection() {
  // تکرار آرایه برای ایجاد لوپ بی‌نهایت و روان
  const infiniteBrands = [...BRAND_IMAGES, ...BRAND_IMAGES];

  return (
    <section className="w-full bg-[#FAFAFA] flex flex-col items-center pt-[80px] pb-[80px] overflow-hidden relative">
      
      {/* --- بخش متنی --- */}
      <div className="flex flex-col items-center text-center px-4 max-w-[800px] z-10 mb-16">
        <h2 className="text-[32px] lg:text-[36px] font-bold text-[#0B0C17] mb-6">
          <span className="text-primary">بهترین برندهای</span> ابزار و یراق در ایران
        </h2>
        <p className="text-[14px] text-[#3C3D45] leading-loose max-w-[650px] mb-8">
          خانه ابزار، واردکننده مستقیم و فروشنده بهترین و معتبرترین برندهای ابزار و یراق در ایران است. ما متعهد هستیم که باکیفیت ترین محصولات را برای شما مشتریان عزیزمان فراهم کنیم.
        </p>
        
        <Link href="/categories/brnd-ha-2329" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
          <span className="text-[14px] font-medium">مشاهده برندها</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* --- بخش کاروسل بی‌نهایت --- */}
      <div className="carousel-wrapper w-full relative group">
        
        {/* کانتینر متحرک کاروسل */}
        <div className="animate-infinite-scroll flex w-max gap-6 px-3">
          {infiniteBrands.map((src, index) => (
            <div 
              key={index} 
              className="group/card relative w-[250px] h-[194px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm cursor-pointer bg-white"
            >
              <Image
                src={src}
                alt={`Brand ${index + 1}`}
                fill
                sizes="250px"
                className="object-cover transition-all duration-500 ease-out group-hover/card:scale-110 group-hover/card:grayscale-[40%]"
              />
              {/* هاله رنگی ملایم هنگام هاور */}
              <div className="absolute inset-0 bg-blue-900/0 group-hover/card:bg-blue-900/10 transition-colors duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* لایه محو‌کننده کناره‌ها برای زیبایی بیشتر */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* --- استایل‌های انیمیشن --- */}
      <style jsx global>{`
        /* انیمیشن برای سایت‌های LTR */
        @keyframes infiniteScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }

        /* انیمیشن مخصوص سایت‌های RTL (مثل خانه ابزار) */
        @keyframes infiniteScrollRtl {
          0% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }

        .animate-infinite-scroll {
          /* سرعت حرکت را می‌توانید با تغییر 40s کم و زیاد کنید */
          animation: infiniteScroll 40s linear infinite;
        }

        /* توقف روان کاروسل هنگام هاور روی کل بخش */
        .carousel-wrapper:hover .animate-infinite-scroll {
          animation-play-state: paused !important;
        }

        /* اعمال جهت درست انیمیشن برای فارسی */
        [dir="rtl"] .animate-infinite-scroll {
          animation-name: infiniteScrollRtl;
        }
      `}</style>
    </section>
  );
}