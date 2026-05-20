import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, BlogPost } from "@/lib/data/blog";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { CalendarIcon, UserIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
// ✅ ایمپورت که وجود داشت:
import { getCategoryLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "مجله مد و استایل رگال | وبلاگ",
  description: "جدیدترین مقالات آموزشی در حوزه مد، فشن و استایل آقایان و بانوان",
};

export default async function BlogListingPage() {
  const posts = await getBlogPosts();

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 pt-10">
      <div className="w-full px-4 lg:px-[5%] xl:px-[120px]">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">مجله رگال</h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-7">
            دنیای مد و استایل را با مقالات تخصصی ما دنبال کنید. از راهنمای ست کردن لباس تا جدیدترین ترندهای سال.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <main className="lg:col-span-8">
            
            {/* ۱. نمایش پست ویژه */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="relative aspect-[2/1] w-full bg-gray-200">
                    {featuredPost.image ? (
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">بدون تصویر</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#B19276]">
                      {/* 👇 تغییر اول: استفاده از تابع ترجمه */}
                      {getCategoryLabel(featuredPost.category)}
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><UserIcon className="w-4 h-4"/> ادمین رگال</span>
                      <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4"/> {new Date(featuredPost.published_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#B19276] transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3 leading-7 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <span className="text-sm font-bold flex items-center gap-2 text-black group-hover:gap-4 transition-all">
                      ادامه مطلب <ArrowLeftIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ۲. لیست سایر مقالات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherPosts.length > 0 ? (
                otherPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                      <div className="relative aspect-[3/2] w-full bg-gray-200 overflow-hidden">
                        {post.image && (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-800">
                          {/* 👇 تغییر دوم: استفاده از تابع ترجمه */}
                          {getCategoryLabel(post.category)}
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {new Date(post.published_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#B19276] transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-3 leading-6 mb-4 flex-grow">
                          {post.excerpt}
                        </p>
                        <span className="text-xs font-bold text-blue-600 mt-auto pt-4 border-t border-gray-50 block w-full text-left">
                          خواندن مقاله
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                !featuredPost && (
                  <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500">هنوز مقاله‌ای منتشر نشده است.</p>
                  </div>
                )
              )}
            </div>

          </main>

          <aside className="lg:col-span-4 sticky top-8">
            <BlogSidebar posts={posts} />
          </aside>

        </div>
      </div>
    </div>
  );
}