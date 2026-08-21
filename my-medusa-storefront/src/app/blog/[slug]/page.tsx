import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, getBlogPosts, getCategories, getComments } from "@/lib/data/blog";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { CalendarIcon, UserIcon, FolderIcon } from "@heroicons/react/24/outline";
import { getCategoryLabel } from "@/lib/constants";
import CommentSection from "@/components/blog/CommentSection";
import ShareButton from "@/components/blog/ShareButton";


type Props = {
  params: Promise<{ slug: string }>;
};

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

// ----------------------------------------------------------------------
// ۱. تولید متادیتا، اُپن‌گراف (Open Graph) و توییتر کارد برای مقاله
// ----------------------------------------------------------------------
export async function generateMetadata(props: Props) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);
  
  // 🟢 تغییر نام به مجله خانه ابزار
  if (!post) return { title: "مطلب یافت نشد | مجله خانه ابزار" };

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://toolshouse.ir";
  const postUrl = `${baseUrl}/blog/${params.slug}`;
  const ogImage = post.image || `${baseUrl}/images/default-blog-og.jpg`; 

  // 🟢 تغییر نام به مجله خانه ابزار
  const seoTitle = `${post.title} | مجله خانه ابزار`;

  return {
    title: seoTitle,
    description: post.excerpt,
    // تگ Canonical
    alternates: {
      canonical: postUrl,
    },
    // تگ‌های Open Graph ویژه مقالات
    openGraph: {
      title: seoTitle,
      description: post.excerpt,
      url: postUrl,
      siteName: "خانه ابزار", // 🟢 تغییر به برند خانه ابزار
      images: [
        {
          url: ogImage,
          width: 1200, // سایز استاندارد لینکدین و فیسبوک برای مقالات
          height: 630,
          alt: post.title,
        },
      ],
      locale: "fa_IR",
      type: "article", // 👈 تغییر کلیدی نسبت به محصول: تایپ روی مقاله تنظیم شد
      publishedTime: post.published_at, // زمان انتشار برای گوگل نیوز و شبکه‌های اجتماعی
      authors: ["خانه ابزار"], // 🟢 تغییر به برند خانه ابزار
    },
    // تگ‌های Twitter
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

// ----------------------------------------------------------------------
// ۲. صفحه اصلی مقاله و تولید خودکار اسکیما (BlogPosting JSON-LD)
// ----------------------------------------------------------------------
export default async function BlogPostPage(props: Props) {
  const params = await props.params;

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

  const [allPosts, categories, comments] = await Promise.all([
    getBlogPosts(),
    getCategories(),
    getComments(post.id)
  ]);

  const categoryTitle = getCategoryLabel(post.category);
  const cleanHTML = cleanContent(post.content);

  // --- ساخت خودکار اسکیما برای مقاله ---
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://toolshouse.ir";
  const postUrl = `${baseUrl}/blog/${params.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": { "@type": "WebPage", "@id": postUrl },
      "headline": post.title,
      "description": post.excerpt,
      "image": post.image ? [post.image] : [],
      // 🟢 مقادیر نویسنده و ناشر به "خانه ابزار" تغییر یافت
      "author": { "@type": "Organization", "name": "خانه ابزار", "url": baseUrl },
      "publisher": { "@type": "Organization", "name": "خانه ابزار", "logo": { "@type": "ImageObject", "url": `${baseUrl}/images/logo.png` } },
      "datePublished": post.published_at,
      "dateModified": post.published_at 
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "صفحه اصلی", "item": baseUrl },
        { "@type": "ListItem", "position": 2, "name": "وبلاگ", "item": `${baseUrl}/blog` },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": postUrl }
      ]
    }
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20 pt-10" dir="rtl">
      
      {/* 🟢 تزریق اسکیما پنهان در هدر صفحه */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
                  <span>توسط: خانه ابزار</span>
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
                className="blog-content prose prose-lg max-w-none prose-img:rounded-xl prose-img:max-w-full prose-headings:text-black prose-p:text-gray-600 prose-a:text-blue-600 prose-pre:overflow-x-auto prose-table:block prose-table:overflow-x-auto break-words"
                dangerouslySetInnerHTML={{ __html: cleanHTML }}
              />

              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <ShareButton />
              </div>

            </article>

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