"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, TrashIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getComments, approveCommentAction, deleteCommentAction } from "./actions"; // 👈 ایمپورت اکشن‌ها
import { toast } from "sonner"; // پیشنهاد: استفاده از toast برای نمایش پیام‌ها

interface Comment {
  id: string;
  author_name: string;
  content: string;
  status: string;
  created_at: string;
  post_title: string;
  post_slug: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // دریافت لیست نظرات با استفاده از Server Action
  const loadComments = async () => {
    try {
      const data = await getComments();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await approveCommentAction(id);
    if (res.success) {
      toast.success("نظر تایید شد");
      loadComments(); // رفرش لیست
    } else {
      toast.error(res.error || "خطا در عملیات");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    
    // UI Optimistic Update (اختیاری: حذف فوری از لیست برای حس سرعت)
    const originalComments = [...comments];
    setComments(comments.filter(c => c.id !== id));

    const res = await deleteCommentAction(id);
    if (res.success) {
      toast.success("نظر حذف شد");
      // نیازی به لود مجدد نیست چون دستی حذف کردیم، اما برای اطمینان:
      // loadComments(); 
    } else {
      toast.error("خطا در حذف");
      setComments(originalComments); // برگرداندن در صورت خطا
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">در حال دریافت نظرات...</div>;

  return (
    <div className="p-8 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">مدیریت نظرات وبلاگ</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b">
            <tr>
              <th className="p-4 font-medium">نویسنده</th>
              <th className="p-4 font-medium">متن نظر</th>
              <th className="p-4 font-medium">مقاله مربوطه</th>
              <th className="p-4 font-medium">تاریخ</th>
              <th className="p-4 font-medium">وضعیت</th>
              <th className="p-4 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comments.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">هیچ نظری یافت نشد.</td>
                </tr>
            ) : (
                comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{comment.author_name}</td>
                    
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={comment.content}>
                    {comment.content}
                    </td>

                    <td className="p-4 text-sm text-blue-600">
                    {comment.post_slug ? (
                        <Link href={`/blog/${comment.post_slug}`} target="_blank" className="flex items-center gap-1 hover:underline">
                        <span className="truncate max-w-[150px]">{comment.post_title}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </Link>
                    ) : (
                        <span className="text-gray-400 text-xs">مقاله حذف شده</span>
                    )}
                    </td>

                    <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    
                    <td className="p-4 whitespace-nowrap">
                    {comment.status === "approved" ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">تایید شده</span>
                    ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">در انتظار</span>
                    )}
                    </td>
                    
                    <td className="p-4 flex gap-2">
                    {comment.status !== "approved" && (
                        <button 
                        onClick={() => handleApprove(comment.id)}
                        className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors border border-transparent hover:border-green-100"
                        title="تایید"
                        >
                        <CheckCircleIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="حذف"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}