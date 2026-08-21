"use client";

import { useState } from "react";
import ProductCard from "@/components/modules/products/ProductCard";

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';

interface DiscountedProductsProps {
  products: any[];
}

export default function DiscountedProducts({ products }: DiscountedProductsProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  if (!products || products.length === 0) return null;

  const enableLoop = products.length > 5;

  return (
    <section className="w-full mt-[100px] px-4 lg:px-[5%] xl:px-[120px] mb-20">
      
      {/* --- هدر بخش --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
            </div>
            <h2 className="text-[24px] lg:text-[28px] font-bold text-[#0B0C17]">
            آخرین محصولات
            </h2>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => swiperInstance?.slidePrev()}
                disabled={!enableLoop && swiperInstance?.isBeginning}
                aria-label="اسلاید قبلی" // اضافه شدن نام برای ربات‌های گوگل
                className="w-[44px] h-[44px] flex items-center justify-center border border-[#E7E7E8] rounded-[12px] hover:bg-black hover:text-white hover:border-black transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <button 
                onClick={() => swiperInstance?.slideNext()}
                disabled={!enableLoop && swiperInstance?.isEnd}
                aria-label="اسلاید بعدی" // اضافه شدن نام برای ربات‌های گوگل
                className="w-[44px] h-[44px] flex items-center justify-center border border-[#E7E7E8] rounded-[12px] hover:bg-black hover:text-white hover:border-black transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
      </div>

      {/* --- کاروسل --- */}
      <div className="w-full">
        <Swiper
            key={products.length}
            modules={[Navigation, Autoplay]}
            onSwiper={(swiper) => setSwiperInstance(swiper)}
            spaceBetween={16}
            slidesPerView={5}
            loop={enableLoop}
            speed={800}
            className="!pb-10"
            breakpoints={{
                0: { slidesPerView: 1.5, spaceBetween: 10 },
                500: { slidesPerView: 2.2, spaceBetween: 12 },
                768: { slidesPerView: 3.2, spaceBetween: 14 },
                1024: { slidesPerView: 4, spaceBetween: 16 },
                1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
        >
            {products.map((product) => (
                <SwiperSlide key={product.id} className="h-auto">
                   <ProductCard product={product} /> 
                </SwiperSlide>
            ))}
        </Swiper>
      </div>

    </section>
  );
}