// مسیر: src/app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/data/blog";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { CalendarIcon, UserIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { getCategoryLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "مجله خانه ابزار | وبلاگ",
  description: "جدیدترین مقالات آموزشی در حوزه ابزار و یراق آلات را در مجله خانه ابزار بخوانید",
};

function normalizeText(str?: string) {
  if (!str) return "";
  return str.replace(/ك/g, "ک").replace(/ي/g, "ی").replace(/ئ/g, "ی").toLowerCase().trim();
}

export default async function BlogListingPage({ searchParams }: { searchParams: Promise<{ page?: string, q?: string }> }) {
  // 🟢 دریافت ایمن پارامترها برای صفحه‌بندی و سرچ
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const rawQuery = params?.q ? String(params.q) : ""; 
  
  const searchQuery = normalizeText(rawQuery);
  const postsPerPage = 7;

  let posts = await getBlogPosts();
  
  // 🔍 اعمال فیلتر زنده و دقیق روی مقالات
  if (searchQuery) {
    posts = posts.filter(post => {
      const title = normalizeText(post.title);
      const excerpt = normalizeText(post.excerpt);
      return title.includes(searchQuery) || excerpt.includes(searchQuery);
    });
  }

  // 🟢 محاسبه صفحات
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  const isSearching = searchQuery.length > 0;
  // 🟢 مقاله ویژه فقط در صفحه اول و زمانی که سرچ نمی‌کنیم نمایش داده شود
  const featuredPost = (!isSearching && currentPage === 1 && currentPosts.length > 0) ? currentPosts[0] : null;
  const otherPosts = featuredPost ? currentPosts.slice(1) : currentPosts;

  const createPageUrl = (pageNumber: number) => {
    const queryParams = new URLSearchParams();
    queryParams.set("page", pageNumber.toString());
    if (rawQuery) queryParams.set("q", rawQuery);
    return `/blog?${queryParams.toString()}`;
  };

  // 🟢 کامپوننت تولید دکمه‌های صفحه‌بندی (هماهنگ با رنگ خانه ابزار)
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

    if (startPage > 1) {
      pages.push(<Link key={1} href={createPageUrl(1)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === 1 ? "bg-[#B19276] text-white" : "bg-white border text-[#B19276]"}`}>1</Link>);
      if (startPage > 2) pages.push(<span key="dots-start" className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>);
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(<Link key={page} href={createPageUrl(page)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === page ? "bg-[#B19276] text-white shadow-sm" : "bg-white border border-gray-200 text-[#B19276] hover:bg-[#B19276] hover:text-white"}`}>{page}</Link>);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>);
      pages.push(<Link key={totalPages} href={createPageUrl(totalPages)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === totalPages ? "bg-[#B19276] text-white" : "bg-white border text-[#B19276]"}`}>{totalPages}</Link>);
    }

    return pages;
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 pt-10" dir="rtl">
      <div className="w-full px-4 lg:px-[5%] xl:px-[120px]">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">مجله خانه ابزار</h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-7">
            {isSearching ? `نتایج جستجو برای: "${rawQuery}"` : "آخرین مقالات و اخبار دنیای ابزار را در مجله خانه ابزار بخوانید"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <main className="lg:col-span-8">
            
            {totalPosts === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 mb-4">
                  {isSearching ? `هیچ مقاله‌ای برای "${rawQuery}" یافت نشد.` : "هنوز مقاله‌ای منتشر نشده است."}
                </p>
                {isSearching && (
                  <Link href="/blog" className="text-[#B19276] font-bold hover:underline">مشاهده همه مقالات</Link>
                )}
              </div>
            ) : (
              <>
                {/* ۱. نمایش پست ویژه (در صفحه اول و بدون سرچ) */}
                {featuredPost && (
                  <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
                      <div className="relative aspect-[2/1] w-full bg-gray-200">
                        {featuredPost.image ? (
                          <Image src={featuredPost.image} alt={featuredPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority unoptimized />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">بدون تصویر</div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#B19276]">
                          {getCategoryLabel(featuredPost.category)}
                        </div>
                      </div>
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1"><UserIcon className="w-4 h-4 text-[#B19276]"/>ادمین خانه ابزار</span>
                          <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4 text-[#B19276]"/> {new Date(featuredPost.published_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#B19276] transition-colors">{featuredPost.title}</h2>
                        <p className="text-gray-600 line-clamp-3 leading-7 mb-6">{featuredPost.excerpt}</p>
                        <span className="text-sm font-bold flex items-center gap-2 text-black group-hover:gap-4 transition-all">ادامه مطلب <ArrowLeftIcon className="w-4 h-4" /></span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* ۲. لیست سایر مقالات */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                        <div className="relative aspect-[3/2] w-full bg-gray-200 overflow-hidden">
                          {post.image && <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-gray-800">
                            {getCategoryLabel(post.category)}
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-[#B19276]"/> {new Date(post.published_at).toLocaleDateString('fa-IR')}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#B19276] transition-colors">{post.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-3 leading-6 mb-4 flex-grow">{post.excerpt}</p>
                          <span className="text-xs font-bold text-blue-600 mt-auto pt-4 border-t border-gray-50 block w-full text-left">خواندن مقاله</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* 📄 نمایش کامپوننت صفحه‌بندی در پایین لیست */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {currentPage > 1 ? (
                  <Link href={createPageUrl(currentPage - 1)} className="flex items-center gap-1 px-4 py-2 bg-white border rounded-xl text-sm font-medium text-[#B19276] hover:bg-[#B19276] hover:text-white transition-colors">
                    <ChevronRightIcon className="w-4 h-4" /> صفحه قبل
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 bg-gray-100 border rounded-xl text-sm text-gray-400 cursor-not-allowed"><ChevronRightIcon className="w-4 h-4" /> صفحه قبل</span>
                )}
                <div className="flex items-center gap-1">{renderPagination()}</div>
                {currentPage < totalPages ? (
                  <Link href={createPageUrl(currentPage + 1)} className="flex items-center gap-1 px-4 py-2 bg-white border rounded-xl text-sm font-medium text-[#B19276] hover:bg-[#B19276] hover:text-white transition-colors">
                    صفحه بعد <ChevronLeftIcon className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 px-4 py-2 bg-gray-100 border rounded-xl text-sm text-gray-400 cursor-not-allowed">صفحه بعد <ChevronLeftIcon className="w-4 h-4" /></span>
                )}
              </div>
            )}

          </main>

          <aside className="lg:col-span-4 sticky top-8">
            <BlogSidebar posts={await getBlogPosts()} />
          </aside>

        </div>
      </div>
    </div>
  );
}