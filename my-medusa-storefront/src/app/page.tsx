import { getProductsList } from "@/lib/data";
import { getReviews } from "@/lib/data/reviews";
import { getBlogPosts } from "@/lib/data/blog";
import dynamic from "next/dynamic";

import Hero from "@/components/modules/hero/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";

const BodyShapeSection = dynamic(() => import("@/components/home/BodyShapeSection"));
const DiscountedProducts = dynamic(() => import("@/components/home/DiscountedProducts"));
const AboutSection = dynamic(() => import("@/components/home/AboutSection"));
const Testimonials = dynamic(() => import("@/components/home/Testimonials"));
const LatestNews = dynamic(() => import("@/components/home/LatestNews"));

export default async function Home() {
  const products = await getProductsList();
  const reviews = await getReviews();
  const blogPosts = await getBlogPosts();

  return (
    <>
      {/* بنر اصلی - بلافاصله لود می‌شود */}
      <Hero />

      {/* دسته‌بندی‌ها - بلافاصله لود می‌شود */}
      <CategoryGrid />

      {/* بخش بادی شیپ - بهینه‌شده برای جاوااسکریپت سبک‌تر */}
      <BodyShapeSection />

      {/* اسلایدر محصولات تخفیف‌دار - بهینه‌شده */}
      <DiscountedProducts products={products} />

      {/* درباره ما - بهینه‌شده */}
      <AboutSection />

      {/* بخش نظرات مشتریان - بهینه‌شده */}
      <Testimonials reviews={reviews} />

      {/* آخرین مقالات - بهینه‌شده */}
      <LatestNews posts={blogPosts} />
    </>
  );
}