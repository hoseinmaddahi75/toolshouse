import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  // --- ردیف اول و دوم ---
  {
    id: 1,
    title: "ابزار اندازه گیری",
    href: "/store?category=dresses",
    image: "/images/cat1.jpg",
    className: "col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2", 
  },
  {
    id: 2,
    title: "ابزار بادی",
    href: "/store?category=suits",
    image: "/images/cat2.jpg",
    className: "col-span-1 lg:col-span-1 lg:row-span-1", 
  },
  {
    id: 3,
    title: "ابزار شارژی",
    href: "/store?category=accessories",
    image: "/images/cat3.jpg",
    className: "col-span-1 lg:col-span-1 lg:row-span-2", 
  },
  {
    id: 4,
    title: "ابزار کشاورزی",
    href: "/store?category=streetwear",
    image: "/images/cat4.jpg",
    className: "col-span-1 lg:col-span-1 lg:row-span-1", 
  },

  // --- ردیف سوم و چهارم ---
  {
    id: 5,
    title: "ابزار برقی",
    href: "/store?category=summer",
    image: "/images/cat5.jpg",
    className: "col-span-1 lg:col-span-1 lg:row-span-2", 
  },
  {
    id: 6,
    title: "ابزار جوش و برش",
    href: "/store?category=bags",
    image: "/images/cat6.jpg",
    className: "col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-1", 
  },
  {
    id: 7,
    title: "ابزارآلات دستی",
    href: "/store?category=jewelry",
    image: "/images/cat7.jpg",
    className: "col-span-1 lg:col-span-1 lg:row-span-2", 
  },
  {
    id: 8,
    title: "قفل و یراق آلات",
    href: "/store?category=watches",
    image: "/images/cat8.jpg",
    className: "col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-1", 
  },
];

export default function CategoryGrid() {
  return (
    <section className="w-full mt-[80px] px-4 lg:px-[5%] xl:px-[120px] mb-20">
      
      {/* تیتر بخش */}
      <div className="flex justify-start mb-8">
        <h2 className="text-[24px] lg:text-[32px] font-bold text-[#0B0C17] relative">
          دسته‌بندی محصولات
          <span className="absolute -bottom-3 right-0 w-2/3 h-[3px] bg-primary rounded-full"></span>
        </h2>
      </div>

      {/* --- کانتینر شبکه/کاروسل --- */}
      {/* تغییرات موبایل (Flex + Scroll):
         1. flex: چیدمان خطی
         2. overflow-x-auto: اسکرول افقی
         3. snap-x snap-mandatory: برای اینکه وقتی کاربر اسکرول کرد، روی عکس‌ها قفل شود (حس اپلیکیشن)
         4. pb-4: پدینگ پایین برای اینکه سایه دکمه‌ها بریده نشود
         5. no-scrollbar: کلاس‌های مخفی کردن نوار اسکرول (در css سراسری یا کلاس‌های اینلاین)
         
         تغییرات دسکتاپ (Grid):
         1. lg:grid: تبدیل به گرید
         2. lg:overflow-visible: غیرفعال کردن اسکرول
         3. lg:pb-0: حذف پدینگ اضافی
      */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 w-full 
                      lg:grid lg:grid-cols-4 lg:auto-rows-[220px] lg:overflow-visible lg:pb-0 lg:gap-4
                      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className={`
              relative group overflow-hidden rounded-2xl
              /* استایل‌های کارت در موبایل (ثابت و یک‌اندازه) */
              min-w-[280px] h-[360px] flex-shrink-0 snap-center
              
              /* استایل‌های کارت در دسکتاپ (انعطاف‌پذیر و بر اساس گرید) */
              lg:min-w-0 lg:w-auto lg:h-auto lg:flex-shrink-1
              
              /* کلاس‌های گرید اختصاصی (فقط در دسکتاپ اعمال می‌شوند چون در موبایل flex است) */
              ${cat.className}
            `}
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

            {/* دکمه شیشه‌ای */}
            <div className="absolute bottom-6 right-6">
                <div className="px-5 py-2.5 rounded-full 
                              bg-white/10 backdrop-blur-md 
                              border border-white/40 
                              text-white text-[14px] font-medium 
                              flex items-center gap-2 
                              transition-all duration-300 
                              group-hover:bg-white/20 group-hover:border-white/60 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  
                  {cat.title}
                  
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 5 12 12 19"></polyline>
                  </svg>
                </div>
            </div>

          </Link>
        ))}
      </div>
    </section>
  );
}