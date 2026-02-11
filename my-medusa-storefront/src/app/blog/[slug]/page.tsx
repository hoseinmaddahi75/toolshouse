import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getBlogPosts, getCategories, getComments } from "@/lib/data/blog";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { CalendarIcon, UserIcon, FolderIcon, ShareIcon } from "@heroicons/react/24/outline";
import { getCategoryLabel } from "@/lib/constants";
// 👇 ایمپورت کامپوننت نظرات (مطمئن شوید فایلش را در components/blog ساخته‌اید)
import CommentSection from "@/components/blog/CommentSection";


type Props = {
  params: Promise<{ slug: string }>;
};

// تابع تمیزکاری محتوای HTML
function cleanContent(content: string) {
  if (!content) return "";
  let cleaned = content
    .replace(/^"|"$/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
  
  if (cleaned.startsWith('<p><p>') && cleaned.endsWith('</p></p>')) {
    cleaned = cleaned.substring(3, cleaned.length - 4);
  }
  return cleaned;
}

// تولید متادیتای سئو
export async function generateMetadata(props: Props) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "مطلب یافت نشد" };
  return {
    title: `${post.title} | مجله رگال`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage(props: Props) {
  const params = await props.params;

  // 1. ابتدا خود مقاله را می‌گیریم (چون برای گرفتن نظرات به ID مقاله نیاز داریم)
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="p-20 text-center bg-[#FAFAFA] min-h-screen pt-40">
        <h1 className="text-3xl font-bold text-red-600 mb-4">خطا: مقاله پیدا نشد!</h1>
        <p className="text-gray-600">اسلاگ درخواست شده: <strong>{params.slug}</strong></p>
        <Link href="/blog" className="text-blue-500 underline mt-4 block">بازگشت به وبلاگ</Link>
      </div>
    );
  }

  // 2. حالا به صورت موازی بقیه اطلاعات را می‌گیریم (نظرات، سایدبار، دسته‌بندی‌ها)
  const [allPosts, categories, comments] = await Promise.all([
    getBlogPosts(),
    getCategories(),
    getComments(post.id) // 👇 دریافت نظرات با استفاده از ID پست
  ]);

  // تبدیل نام دسته‌بندی به فارسی
  const categoryTitle = getCategoryLabel(post.category);
  const cleanHTML = cleanContent(post.content);

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 pt-10" dir="rtl">
      <div className="w-full px-4 lg:px-[5%] xl:px-[120px]">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href="/" className="hover:text-black">صفحه اصلی</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-black">وبلاگ</Link>
          <span>/</span>
          <span className="text-[#B19276] font-medium truncate max-w-[200px]">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <main className="lg:col-span-8 space-y-8">
            <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
              
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>توسط: ادمین رگال</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(post.published_at).toLocaleDateString('fa-IR', { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-4 h-4" />
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                    {categoryTitle}
                  </span>
                </div>
              </div>

              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 bg-gray-100">
                {post.image ? (
                  <Image 
                    src={post.image} 
                    alt={post.title} 
                    fill 
                    className="object-cover"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">بدون تصویر</div>
                )}
              </div>

              <div 
                className="blog-content prose prose-lg max-w-none prose-img:rounded-xl prose-headings:text-black prose-p:text-gray-600 prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: cleanHTML }}
              />

              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">برچسب‌ها:</span>
                    <div className="flex gap-2">
                        <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-gray-600">مد</span>
                        <span className="text-xs bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-gray-600">استایل</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-[#B19276] transition-colors">
                    <ShareIcon className="w-4 h-4" />
                    اشتراک گذاری
                </button>
              </div>

            </article>

            {/* 👇 بخش نظرات داینامیک */}
            {/* ما ID پست و لیست نظرات اولیه را به کامپوننت پاس می‌دهیم */}
            <CommentSection postId={post.id} initialComments={comments} />

          </main>

          <aside className="lg:col-span-4 sticky top-8">
            <BlogSidebar posts={allPosts} />
          </aside>

        </div>
      </div>
    </div>
  );
}