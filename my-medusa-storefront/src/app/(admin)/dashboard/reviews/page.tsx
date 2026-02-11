"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Trash2, Star, Clock, Loader2 } from "lucide-react";
import { getProductReviews, updateReviewStatusAction, deleteReviewAction } from "./actions"; 

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // لود کردن نظرات
  const loadReviews = async () => {
    try {
      const data = await getProductReviews();
      
      // 🕵️‍♂️ دیباگ: دیدن ساختار واقعی دیتا در کنسول مرورگر
      console.log("🔥 Reviews Data:", data);
      
      setReviews(data);
    } catch (e) {
      toast.error("خطا در دریافت نظرات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // هندل تغییر وضعیت
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const oldReviews = [...reviews];
    setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));

    const res = await updateReviewStatusAction(id, status);
    
    if (res.success) {
      toast.success(status === "approved" ? "نظر تایید شد" : "نظر رد شد");
    } else {
      toast.error(res.error || "خطا در عملیات");
      setReviews(oldReviews);
    }
  };

  // هندل حذف
  const deleteReview = async (id: string) => {
    if(!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;

    const oldReviews = [...reviews];
    setReviews(reviews.filter(r => r.id !== id)); 

    const res = await deleteReviewAction(id);
    
    if (res.success) {
      toast.success("حذف شد");
    } else {
      toast.error("خطا در حذف");
      setReviews(oldReviews);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-gray-400 w-8 h-8" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-8" dir="rtl">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">مدیریت نظرات محصولات</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 border-b text-gray-600">
            {/* 🔴 ارور قبلی اینجا بود: کامنت‌ها حذف شدند */}
            <tr>
              <th className="p-4 font-medium">کاربر</th>
              <th className="p-4 font-medium">امتیاز</th>
              <th className="p-4 font-medium">محصول</th>
              <th className="p-4 font-medium">نظر</th>
              <th className="p-4 font-medium">وضعیت</th>
              <th className="p-4 font-medium text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-500">هیچ نظری یافت نشد.</td>
                </tr>
            ) : (
                reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{rev.user_name || "کاربر ناشناس"}</td>
                    
                    <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 w-fit px-2 py-1 rounded-md">
                            <span className="font-bold">{rev.rating}</span> 
                            <Star className="w-3 h-3 fill-current" />
                        </div>
                    </td>

                    {/* 🟢 تلاش برای پیدا کردن نام محصول به روش‌های مختلف */}
                    <td className="p-4 text-gray-700 text-xs font-bold flex items-center gap-2">
    
    <span className="truncate max-w-[150px]" title={rev.product_title}>
        {rev.product_title || "-"}
    </span>
</td>

                    <td className="p-4 max-w-xs text-gray-600 truncate" title={rev.comment}>
                        {rev.content || rev.comment}
                    </td>

                    <td className="p-4">
                        {rev.status === "approved" && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">تایید شده</span>
                        )}
                        {rev.status === "rejected" && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium border border-red-200">رد شده</span>
                        )}
                        {(rev.status === "pending" || !rev.status) && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200 flex w-fit items-center gap-1">
                                <Clock className="w-3 h-3"/> در انتظار
                            </span>
                        )}
                    </td>

                    <td className="p-4 flex justify-center gap-2">
                        {rev.status !== "approved" && (
                            <Button size="sm" onClick={() => updateStatus(rev.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0 rounded-lg shadow-sm" title="تایید">
                                <Check className="w-4 h-4" />
                            </Button>
                        )}
                        {rev.status !== "rejected" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(rev.id, "rejected")} className="text-orange-600 border-orange-200 h-8 w-8 p-0 rounded-lg hover:bg-orange-50 hover:text-orange-700" title="رد کردن">
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteReview(rev.id)} className="text-red-500 hover:text-red-600 h-8 w-8 p-0 rounded-lg hover:bg-red-50" title="حذف">
                            <Trash2 className="w-4 h-4" />
                        </Button>
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