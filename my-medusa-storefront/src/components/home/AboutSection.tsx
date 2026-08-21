"use client";

import Image from "next/image";

const features = [
  {
    title: "بهترین کیفیت",
    description: "ما متعهدیم که بهترین محصولات بازار را با بهترین کیفیت در اختیار شما مشتریان عزیزمان در سراسر ایران عزیز قرار دهیم.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
    ),
  },
  {
    title: "تعهد به خدمات",
    description: "ما متعهدیم که محصولات را در سریع ترین زمان و به امن ترین حالت ممکن به شما برسانیم، بسته بندی محصولات استاندارد باشد.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
        <path d="m9 11 3 3L22 4"></path>
      </svg>
    ),
  },
  {
    title: "سرعت در ارسال",
    description: "ما وظیفه داریم که محصولات و سفارشات شما را در سریع ترین زمان ممکن به دست شما برسانیم. تلاش ما همیشه همین بوده",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
      </svg>
    ),
  },
  {
    title: "امنیت داده ها",
    description: "امنیت بی نظیر پلتفرم ما، امنیت داده ها و اطلاعات شما را تضمین می کند. ما این را وظیفه خود می دانیم.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
];

const AboutSection = () => {
  return (
    <section className="w-full bg-[#FAFAFA] py-16 lg:py-24 px-4 lg:px-[5%] xl:px-[120px]">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start">
        
        {/* --- ستون متن (سمت راست) --- */}
        <div className="w-full lg:w-[60%] flex flex-col justify-center order-2 lg:order-1">
            
            <h2 className="text-3xl font-bold text-black mb-4">
               کشف کیفیت و تعهد با<span className="text-primary"> خانه ابزار</span>
            </h2>
            <p className="text-[14px] text-[#3C3D45] leading-7 mb-10 max-w-3xl text-justify">
خانه ابزار، جایی است که می توانید کیفیت و تعهد را تجربه کنید. ما متعهد هستیم که محصولات با کیفیت را با بهترین قیمت و بالاترین کیفیت در اختیار شما عزیزان قرار دهیم. می توانید به صورت آنلاین از طریق وب سایت سفارش خود را ثبت کنید.            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative">
                {features.map((item, index) => (
                    <div key={index} className="flex flex-col items-start relative">
                        {(index % 2 === 0) && (
                            <div className="hidden md:block absolute left-[-1.5rem] top-2 bottom-2 w-[1px] bg-[#E7E7E8]"></div>
                        )}
                        <div className="w-[50px] h-[50px] bg-white rounded-[8px] flex items-center justify-center mb-4 border border-gray-50 text-gray-400">
                            {item.icon}
                        </div>
                        <h3 className="text-[16px] font-bold text-black mb-2">
                            {item.title}
                        </h3>
                        <p className="text-[13px] text-[#3C3D45] leading-6 text-justify">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

        </div>

        {/* --- ستون تصاویر (سمت چپ) --- */}
        <div className="w-full lg:w-[40%] flex gap-4 h-full relative order-1 lg:order-2">
            
            {/* 1. تصاویر دوتایی (اول کد میاد تا بره سمت راست) */}
            <div className="w-1/2 flex flex-col gap-4 -mt-8 mb-8">
                <div className="relative w-full aspect-[4/3] flex-1">
                    <Image 
                        src="/images/about-1.jpg" 
                        alt="Quality Fabric"
                        fill
                        className="object-cover rounded-[16px]"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                </div>
                <div className="relative w-full aspect-[4/3] flex-1">
                    <Image 
                        src="/images/about-2.jpg" 
                        alt="Tailoring"
                        fill
                        className="object-cover rounded-[16px]"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                </div>
            </div>

            {/* 2. تصویر تکی بزرگ (دوم کد میاد تا بره سمت چپ) */}
            <div className="w-1/2 relative aspect-[3/4]">
                <Image 
                    src="/images/about.jpg" 
                    alt="Regal Style"
                    fill
                    className="object-cover rounded-[16px]"
                    sizes="(max-width: 768px) 50vw, 20vw"
                />
            </div>

        </div>

      </div>
    </section>
  );
};

export default AboutSection;