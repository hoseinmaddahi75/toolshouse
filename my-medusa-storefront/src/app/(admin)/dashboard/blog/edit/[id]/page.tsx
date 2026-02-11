import { getBlogCategories, getPost } from "../../create/actions";
import PostForm from "@/components/admin/post-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// تعریف تایپ پارامتر به صورت Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: PageProps) {
  // ✅ تغییر اصلی اینجاست: اول پارامترها را await می‌کنیم
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  // دریافت همزمان اطلاعات پست و دسته‌بندی‌ها با آیدی درست
  const [post, categories] = await Promise.all([
    getPost(postId),
    getBlogCategories()
  ]);

  if (!post) {
    return (
        <div className="p-10 text-center flex flex-col items-center gap-4">
            <h2 className="text-xl font-bold text-red-500">مقاله یافت نشد</h2>
            <p className="text-gray-500">آیدی درخواست شده: {postId}</p>
            <Link href="/dashboard/blog">
                <Button variant="outline">بازگشت به لیست</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/blog">
            <Button variant="ghost" size="icon"><ArrowRight /></Button>
        </Link>
        <h1 className="text-2xl font-bold">ویرایش مقاله: {post.title}</h1>
      </div>
      
      {/* پاس دادن اطلاعات اولیه به فرم */}
      <PostForm categories={categories} initialData={post} />
    </div>
  );
}