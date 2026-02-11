import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/data/blog";
import { ClockIcon } from "@heroicons/react/24/outline";

// کامپوننت کمکی برای لیست مقالات کوچک
const MiniPostCard = ({ post }: { post: BlogPost }) => (
  <Link href={`/blog/${post.slug}`} className="flex gap-4 group mb-6 last:mb-0">
    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
      {post.image ? (
        <Image 
          src={post.image} 
          alt={post.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">بدون عکس</div>
      )}
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#B19276] transition-colors mb-2">
        {post.title}
      </h4>
      <div className="flex items-center text-xs text-gray-400">
        <ClockIcon className="w-3 h-3 ml-1" />
        {new Date(post.published_at).toLocaleDateString('fa-IR')}
      </div>
    </div>
  </Link>
);

export default function BlogSidebar({ posts }: { posts: BlogPost[] }) {
  // برای دمو، لیست را برش می‌زنیم
  const relatedPosts = posts.slice(0, 3);
  const featuredPosts = posts.slice(0, 4);

  const tags = ["مد و فشن", "استایل تابستانه", "کفش", "اکسسوری", "لباس مجلسی", "ترند ۲۰۲۴"];

  return (
    <aside className="space-y-8">
      
      {/* 1. مقالات مرتبط (تصویر دار) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6 border-r-4 border-[#B19276] pr-3">
          مقالات مرتبط
        </h3>
        <div>
          {relatedPosts.map(post => <MiniPostCard key={post.id} post={post} />)}
        </div>
      </div>

      {/* 2. مطلب برگزیده هفته (متنی) */}
      <div className="bg-[#F9F9F9] rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6 border-r-4 border-[#B19276] pr-3">
          مطلب برگزیده هفته
        </h3>
        <div className="space-y-4">
          {featuredPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <div className="flex items-start gap-3">
                <span className="text-2xl font-bold text-gray-200 group-hover:text-[#B19276] transition-colors -mt-2">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 group-hover:text-black transition-colors leading-6">
                    {post.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                   نویسنده: ادمین رگال
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. برچسب‌ها (Tags) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6 border-r-4 border-[#B19276] pr-3">
          برچسب‌ها
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-[#B19276] hover:text-white hover:border-[#B19276] transition-all cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

    </aside>
  );
}