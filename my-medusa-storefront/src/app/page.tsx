import { getProductsList } from "@/lib/data";
import Hero from "@/components/modules/hero/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import BodyShapeSection from "@/components/home/BodyShapeSection";
import DiscountedProducts from "@/components/home/DiscountedProducts";
import AboutSection from "@/components/home/AboutSection";
import { getReviews } from "@/lib/data/reviews";
import Testimonials from "@/components/home/Testimonials";
import { getBlogPosts } from "@/lib/data/blog";
import LatestNews from "@/components/home/LatestNews";



export default async function Home() {
  // دریافت لیست محصولات از دیتابیس (مدوسا)
  const products = await getProductsList();
  const reviews = await getReviews()
  const blogPosts = await getBlogPosts();

  return (
    <>
      {/* بنر اصلی */}
      <Hero />

      {/* دسته‌بندی‌ها */}
      <CategoryGrid />

      {/* بخش بادی شیپ */}
      <BodyShapeSection />

      {/* اسلایدر محصولات تخفیف‌دار */}
      <DiscountedProducts products={products} />

      {/* درباره ما */}
      <AboutSection />


      {/* بخش نظرات مشتریان */}
      <Testimonials reviews={reviews} />


      <LatestNews posts={blogPosts} />

    </>
  );
}