import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/data/blog";
// 👇 ۱. اضافه کردن ایمپورت تابع ترجمه
import { getCategoryLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

const LatestNews = ({ posts }: { posts: BlogPost[] }) => {
  if (!posts || posts.length === 0) return null;

  const latestPosts = posts.slice(0, 3);

  return (
    <section className="py-20 px-4 lg:px-[5%] xl:px-[120px] bg-[#FAFAFA]">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">مجله مد و استایل</h2>
          <p className="text-[#54555D] text-sm">آخرین مقالات ما را بخوانید</p>
        </div>
        <Link href="/blog" className="text-black text-sm font-medium hover:underline">
          مشاهده همه مطالب &larr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {latestPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full">
            <article className="bg-white h-full flex flex-col rounded-[16px] overflow-hidden transition-all duration-300 shadow-none border-none hover:shadow-xl hover:-translate-y-2">
              
              <div className="relative aspect-[432/220] w-full bg-gray-100">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                
                <div className="mb-4">
                  <span className="inline-block bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-full">
                    {/* 👇 ۲. استفاده از تابع ترجمه در اینجا */}
                    {getCategoryLabel(post.category)}
                  </span>
                </div>
                
                <h3 className="text-[18px] font-bold text-black mb-3 leading-snug line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-[#54555D] text-[14px] leading-7 mb-6 line-clamp-3 flex-grow text-justify">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-[#737373] text-[14px]">
                  <svg className="w-4 h-4 ml-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  {new Date(post.published_at).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LatestNews;