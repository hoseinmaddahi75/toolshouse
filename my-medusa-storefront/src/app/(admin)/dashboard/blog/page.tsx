// src/app/(admin)/dashboard/blog/page.tsx

import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation"; // اضافه شده برای ریدایرکت امنیتی
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Edit, Calendar, Eye, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DeletePostButton from "@/components/admin/delete-post-button";
import { getCategoryLabel } from "@/lib/constants";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const BASE_URL = MEDUSA_BACKEND_URL;
  
  // ۱. دریافت توکن ادمین از کوکی‌ها
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;

  // ۲. چک امنیتی: اگر توکن نیست، به صفحه ورود برگرد
  if (!token) {
    redirect("/admin/login");
  }

  let posts = [];
  let errorMsg = "";

  try {
    // ۳. درخواست با استاندارد Bearer Token
    const res = await fetch(`${BASE_URL}/admin/blog`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 👈 اصلاح اصلی: استفاده از توکن به جای کوکی خام
      },
      cache: "no-store",
      credentials: "include",
    });

    if (res.ok) {
        const data = await res.json();
        posts = data.posts || [];
    } else {
        const text = await res.text();
        console.error("Admin Blog Error:", text);
        
        // اگر توکن منقضی شده بود
        if (res.status === 401) {
            redirect("/admin/login");
        }

        errorMsg = `Status: ${res.status} - ${text}`;
    }
  } catch (e: any) {
    console.error("Fetch Error:", e);
    errorMsg = "خطا در برقراری ارتباط با سرور";
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">وبلاگ </h1>
            <p className="text-gray-500 mt-1">مدیریت مقالات و اخبار سایت</p>
        </div>
        <Link href="/dashboard/blog/create">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4" /> نوشتن مقاله جدید
            </Button>
        </Link>
      </div>

      {/* نمایش خطا در صورت وجود (برای دیباگ) */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-3 dir-ltr text-left">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm font-mono">{errorMsg}</div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-right">
              {/* هدر جدول */}
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500 w-[80px]">تصویر</th>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500">عنوان مقاله</th>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500">دسته‌بندی</th>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500">وضعیت</th>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500">تاریخ انتشار</th>
                  <th className="h-12 px-6 align-middle font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              
              {/* بدنه جدول */}
              <tbody className="divide-y">
                {posts.length === 0 && !errorMsg ? (
                    <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="w-10 h-10 text-gray-300" />
                                <p>هنوز مقاله‌ای یافت نشد.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    posts.map((post: any) => (
                    <tr key={post.id} className="transition-colors hover:bg-gray-50">
                        {/* ستون تصویر */}
                        <td className="p-4 align-middle">
                            <div className="h-12 w-16 relative rounded overflow-hidden bg-gray-200 border">
                                {post.image ? (
                                    <img 
                                        src={post.image} 
                                        alt={post.title} 
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        </td>
                        {/* ستون عنوان */}
                        <td className="p-4 align-middle font-medium text-gray-900">
                            {post.title}
                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px] dir-ltr text-right">
                                /{post.slug}
                            </div>
                        </td>
                        {/* ستون دسته‌بندی */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getCategoryLabel(post.category)}
                        </td>
                        {/* ستون وضعیت */}
                        <td className="p-4 align-middle">
                            {post.status === "published" ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">منتشر شده</Badge>
                            ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">پیش‌نویس</Badge>
                            )}
                        </td>
                        {/* ستون تاریخ */}
                        <td className="p-4 align-middle text-gray-500">
                            <div className="flex items-center gap-1 text-xs">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.published_at || post.created_at).toLocaleDateString('fa-IR')}
                            </div>
                        </td>
                        {/* ستون عملیات */}
                        <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                                <Link href={`/blog/${post.slug}`} target="_blank" title="مشاهده در سایت">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href={`/dashboard/blog/edit/${post.id}`}>
                                    <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                                </Link>
                                {/* دکمه حذف جداگانه */}
                                <DeletePostButton id={post.id} />
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}