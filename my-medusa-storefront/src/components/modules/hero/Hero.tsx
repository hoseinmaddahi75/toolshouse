import Image from "next/image";
import Link from "next/link";

const CAROUSEL_IMAGES = [
  "/images/carusel1.png",
  "/images/carusel2.png",
  "/images/carusel3.png",
  "/images/carusel4.png",
  "/images/carusel5.png",
];

export default function Hero() {
  return (
    <section className="relative w-full pt-[40px] lg:pt-[70px] mb-20 overflow-hidden">
      
      {/* --- تصویر پس‌زمینه (Hero Shape) --- */}
      <div className="absolute top-0 left-0 -z-10 w-[200px] h-[200px] lg:w-[821px] lg:h-[848px] pointer-events-none">
        <Image
          src="/images/hero-shape.png"
          alt="Abstract Shape"
          fill
          className="object-contain object-left-top"
          sizes="(max-width: 1024px) 200px, 821px"
        />
      </div>

      {/* --- کانتینر اصلی --- */}
      <div className="flex flex-col lg:flex-row items-stretch justify-end gap-[32px] px-4 lg:px-0 lg:pr-[5%] xl:pr-[120px]">
        
        {/* --- ستون سمت راست (تصویر اصلی) --- */}
        <div className="hidden lg:block relative w-[540px] h-[700px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl z-10">
          <Image
            src="/images/hero-main.jpg"
            alt="Hero Main Model"
            fill
            className="object-cover"
            priority={true}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* --- ستون سمت چپ --- */}
        <div className="relative flex flex-col justify-between flex-1 min-w-0">
          
          <div className="flex flex-col items-start w-full lg:max-w-[680px]">
            
            <h1 className="text-[32px] lg:text-[48px] font-bold leading-tight text-[#0B0C17] w-full mb-4 lg:mb-6">
             ابزارهایی که{" "}
              <span className="bg-[#febd1b] px-2 rounded-lg inline-block">
                داستان
              </span>{" "}
              شما را روایت می‌کنند
            </h1>

            <p className="text-[14px] lg:text-[16px] text-[#23242E] w-full mb-6 lg:mb-8 leading-relaxed">
             خرید انلاین ابزار و یراق آلات با بالاترین کیفیت و بهترین قیمت در فروشگاه خانه ابزار | ارسال به سراسر کشور تنوع بالای محصولات
            </p>

            {/* --- ۱. تگ‌ها (اصلاح شده برای اسکرول افقی در موبایل) --- */}
            <div className="flex flex-nowrap overflow-x-auto items-center gap-[8px] mb-8 lg:mb-10 w-full pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <TagButton text="تنوع بالای ابزارها" />
              <TagButton text="برقی و شارژی" />
              <TagButton text="برندهای خاص" />
              
              {/* دکمه رنگ‌بندی */}
              <div className="h-[40px] px-[24px] py-[12px] bg-[#F7F7F8] border border-[#E7E7E8] rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0">
                <span className="text-[14px] text-[#0B0C17]">برندهای معتبر و معروف ...</span>
                <div className="flex items-center gap-1 mr-2">

                </div>
              </div>
            </div>

            {/* --- ۲. دکمه CTA (اصلاح سایز در موبایل) --- */}
            <div className="flex items-center gap-4 w-auto">
              <Link
                href="/store"
                className="w-[180px] lg:w-[209px] h-[48px] bg-[#febd1b] text-black rounded-[8px] flex items-center justify-center gap-3 hover:bg-[#e3a305] transition-colors shadow-md flex-shrink-0"
              >
                <span className="text-[14px] lg:text-[16px] font-medium">مشاهده محصولات</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </Link>

              {/* نمایش فلش در موبایل (hidden حذف شد) */}
              <div className="relative w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] block opacity-80">
                 <Image 
                    src="/images/Arrow.png" 
                    alt="arrow decoration" 
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 40px, 50px"
                 />
              </div>
            </div>

          </div>

          {/* --- ۳. بخش کاروسل (اصلاح سایز تصاویر) --- */}
          <div className="relative w-full h-[220px] lg:h-[312px] mt-8 lg:mt-8"> 
             
             <div className="absolute right-0 bottom-0 h-full w-[100vw] rounded-tr-none lg:rounded-tr-2xl lg:rounded-tl-md overflow-hidden flex items-center">
                
                <div className="flex w-max animate-scroll gap-4 lg:gap-10 rounded">
                  
                  {/* سری اول */}
                  {CAROUSEL_IMAGES.map((src, index) => (
                    <div key={`set1-${index}`} className="relative h-[220px] w-[210px] lg:h-[312px] lg:w-[300px] flex-shrink-0 rounded-xl lg:rounded-2xl overflow-hidden">
                        <Image
                        src={src}
                        alt={`Carousel ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 1024px) 210px, 300px"
                        />
                    </div>
                  ))}

                  {/* سری دوم */}
                  {CAROUSEL_IMAGES.map((src, index) => (
                    <div key={`set2-${index}`} className="relative h-[220px] w-[210px] lg:h-[312px] lg:w-[300px] flex-shrink-0 rounded-xl lg:rounded-2xl overflow-hidden">
                        <Image
                        src={src}
                        alt={`Carousel Duplicate ${index + 1}`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 1024px) 210px, 300px"
                        />
                    </div>
                  ))}

                </div>
             </div>
          </div>

          {/* دایره روی کاروسل */}
          <div className="absolute bottom-[200px] lg:bottom-[260px] left-4 lg:left-[250px] w-[70px] h-[70px] lg:w-[104px] lg:h-[104px] z-10 drop-shadow-xl pointer-events-none">
            <Image
                src="/images/carusel-circle.png"
                alt="Detail Circle"
                fill
                className="object-contain animate-spin-slow"
                sizes="(max-width: 1024px) 70px, 104px"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

function TagButton({ text }: { text: string }) {
  return (
    <button className="h-[40px] px-[24px] py-[12px] bg-[#F7F7F8] border border-[#E7E7E8] rounded-full text-[14px] text-[#0B0C17] hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0">
      {text}
    </button>
  );
}