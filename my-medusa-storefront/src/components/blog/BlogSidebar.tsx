// مسیر: src/components/blog/BlogSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogPost } from "@/lib/data/blog";
import { ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface BlogSidebarProps {
  posts: BlogPost[];
}

const MiniPostCard = ({ post }: { post: BlogPost }) => (
  <Link href={`/blog/${post.slug}`} className="flex gap-4 group mb-6 last:mb-0">
    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
      {post.image ? (
        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">بدون عکس</div>
      )}
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors mb-2">
        {post.title}
      </h4>
      <div className="flex items-center text-xs text-gray-400">
        <ClockIcon className="w-3 h-3 ml-1" />
        {new Date(post.published_at).toLocaleDateString('fa-IR')}
      </div>
    </div>
  </Link>
);

export default function BlogSidebar({ posts }: BlogSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // اگر پارامتری در URL بود، مقدار باکس جستجو را آپدیت کن
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const relatedPosts = posts.slice(0, 3);
  const featuredPosts = posts.slice(0, 4);

  // 🟢 هندل کردن جستجو با روتر خود Next.js
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // در جستجوی جدید همیشه برو صفحه اول
    
    // پوش کردن آدرس جدید بدون رفرش کامل صفحه
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <aside className="space-y-8">
      
      {/* باکس جستجو */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 border-r-4 border-primary pr-3">
          جستجو در مقالات
        </h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="عنوان مقاله مورد نظر..."
            className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors focus:bg-white"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* مقالات مرتبط */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-6 border-r-4 border-primary pr-3">
          مقالات مرتبط
        </h3>
        <div>
          {relatedPosts.map(post => <MiniPostCard key={post.id} post={post} />)}
        </div>
      </div>

      {/* مطلب برگزیده هفته */}
      <div className="bg-[#F9F9F9] rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-6 border-r-4 border-primary pr-3">
          مطلب برگزیده هفته
        </h3>
        <div className="space-y-4">
          {featuredPosts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <div className="flex items-start gap-3">
                <span className="text-2xl font-bold text-gray-200 group-hover:text-primary transition-colors -mt-2">
                  0{index + 1}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors leading-6">
                    {post.title}
                  </h4>
                  {/* نام نویسنده به خانه ابزار تغییر یافت */}
                  <span className="text-[10px] text-gray-400 mt-1 block">نویسنده: خانه ابزار</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </aside>
  );
}