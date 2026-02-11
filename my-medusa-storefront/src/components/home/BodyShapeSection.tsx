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
        <button className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
          <span className="text-[14px] font-medium">مشاهده برندها</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* --- بخش کاروسل بی‌پایان --- */}
      <div className="w-full relative">
        {/* کانتینر اصلی که انیمیشن روی آن اجرا می‌شود */}
        <div className="flex w-max animate-scroll gap-6 px-3">
          
          {/* سری اول تصاویر (6 عدد) */}
          {BRAND_IMAGES.map((src, index) => (
            <div key={`first-${index}`} className="relative w-[250px] h-[194px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={src}
                alt={`Brand ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}

          {/* سری دوم تصاویر (دقیقاً تکرار سری اول برای پر کردن فضای خالی) */}
          {BRAND_IMAGES.map((src, index) => (
            <div key={`second-${index}`} className="relative w-[250px] h-[194px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={src}
                alt={`Brand Repeat ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* لایه گرادینت برای محو شدن کناره‌ها (اختیاری) */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
      </div>
    </section>
  );
}