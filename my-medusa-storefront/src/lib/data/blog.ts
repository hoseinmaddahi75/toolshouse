import { notFound } from "next/navigation";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  published_at: string;
  category: string;
  status: string;
}

const BACKEND_URL = MEDUSA_BACKEND_URL;

// 👇 کلید جدید و سالم را اینجا مستقیم قرار دادیم
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_API_KEY,
};

// --- دریافت لیست مقالات ---
export async function getBlogPosts(): Promise<BlogPost[]> {
  const url = `${BACKEND_URL}/store/blog`;
  
  try {
    const res = await fetch(url, {
      headers: headers,
      cache: "no-store",
    });

    if (!res.ok) {
        // اگر خطا داد (مثلا جدول بلاگ نبود)، آرایه خالی بده تا سایت بالا بیاید
        const errorText = await res.text();
        console.error(`❌ List Fetch Error (${res.status}):`, errorText);
        return [];
    }
    
    const data = await res.json();
    return data.posts || [];
  } catch (error) {
    console.error("❌ List Network Error:", error);
    return [];
  }
}

// --- دریافت یک مقاله تکی ---
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const url = `${BACKEND_URL}/store/blog/${slug}`;
  
  try {
    const res = await fetch(url, {
      headers: headers,
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`❌ Single Post Fetch Error (${res.status}):`, await res.text());
      return null;
    }

    const data = await res.json();
    if (data.post) return data.post;
    return null;

  } catch (error) {
    console.error("❌ Single Post Network Error:", error);
    return null;
  }
}

// --- دریافت دسته‌بندی‌ها ---
export async function getCategories() {
  const url = `${BACKEND_URL}/store/blog-categories`;
  try {
    const res = await fetch(url, {
      headers: headers,
      next: { tags: ["blog-categories"], revalidate: 3600 }, 
    });
    
    if (res.ok) {
      const data = await res.json();
      return data.categories || [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return [];
}

// --- دریافت نظرات ---
export async function getComments(postId: string) {
  const url = `${BACKEND_URL}/store/blog/${postId}/comments`;
  // 👇 اینجا هم از همان کلید ثابت بالا استفاده می‌کنیم
  try {
    const res = await fetch(url, { headers: headers, cache: "no-store" });
    const data = await res.json();
    return data.comments || [];
  } catch (error) {
    return [];
  }
}