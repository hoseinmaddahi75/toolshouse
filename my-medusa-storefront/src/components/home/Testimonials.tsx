"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
// 👇 اضافه شدن Navigation به ماژول‌ها
import { Pagination, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation'; // استایل نویگیشن
import { Review } from "@/lib/data/reviews";

// آیکون ستاره
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#B19276" : "#E5E7EB"}
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
      clipRule="evenodd"
    />
  </svg>
);

// آیکون فلش راست (برای دکمه قبلی)
const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// آیکون فلش چپ (برای دکمه بعدی)
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

interface TestimonialsProps {
  reviews: Review[];
}

const Testimonials = ({ reviews }: TestimonialsProps) => {
  if (!reviews || reviews.length === 0) {
    return null; 
  }

  return (
    <section className="w-full bg-white py-20 px-4 lg:px-[5%] xl:px-[120px] relative group">
      
      {/* هدر بخش */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-black mb-4">
          مشتریان ما چه می‌گویند؟
        </h2>
      </div>

      {/* کانتینر اسلایدر (برای پوزیشن دهی دکمه‌ها) */}
      <div className="relative w-full">
        
        {/* 👇 دکمه بعدی (سمت چپ) */}
        <button className="testi-next absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-md transition-all hover:bg-[#B19276] hover:text-white hover:border-[#B19276] hidden md:flex">
          <ChevronLeft />
        </button>

        {/* 👇 دکمه قبلی (سمت راست) */}
        <button className="testi-prev absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10 w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-700 shadow-md transition-all hover:bg-[#B19276] hover:text-white hover:border-[#B19276] hidden md:flex">
          <ChevronRight />
        </button>

        <Swiper
          modules={[Pagination, Autoplay, Navigation]} // اضافه کردن Navigation
          spaceBetween={40}
          slidesPerView={3}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          // 👇 اتصال دکمه‌ها به سواپر
          navigation={{
            nextEl: '.testi-next',
            prevEl: '.testi-prev',
          }}
          loop={reviews.length > 3}
          className="!pb-12 !px-2" // یکم پدینگ افقی برای اینکه سایه ها کات نشن
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 3, spaceBetween: 40 },
          }}
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="h-full flex flex-col px-2">
                
                {/* هدر: عکس + مشخصات + آیکون */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-[16px] overflow-hidden bg-gray-100 flex-shrink-0">
                      {review.image ? (
                        <Image 
                          src={review.image} 
                          alt={review.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={true} 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#B19276] flex items-center justify-center text-white font-bold text-xl">
                          {review.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-black font-bold text-[16px]">
                        {review.name}
                      </span>
                      <span className="text-black text-[12px] mt-1">
                        {review.role}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-10 h-10 opacity-60"> 
                    <Image 
                      src="/icons/QuoteIcon.png" 
                      alt="quote"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>

                <p className="text-black text-[16px] leading-7 text-justify mb-4">
                  {review.content}
                </p>

                <div className="flex gap-1 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled={i < review.rating} />
                  ))}
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;