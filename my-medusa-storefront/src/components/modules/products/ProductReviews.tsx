"use client";

import { useState, useEffect } from "react";
import { Star, User, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
// 👇 دریافت کلید از متغیرهای محیطی
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ count: 0, average: 0 });

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/store/product-reviews?product_id=${productId}`, {
        // 👇 اضافه کردن هدر برای GET
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
      });
      
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats({ count: data.count, average: data.average_rating });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating) return toast.error("نام و امتیاز را وارد کنید");

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/store/product-reviews`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            // 👇 اضافه کردن هدر برای POST
            "x-publishable-api-key": PUBLISHABLE_KEY, 
        },
        body: JSON.stringify({
          product_id: productId,
          user_name: name,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "خطا در برقراری ارتباط");
      }

      toast.success("نظر شما با موفقیت ثبت شد");
      setName("");
      setComment("");
      setRating(5);
      fetchReviews(); 
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (score: number, interactive = false) => (
    <div className="flex gap-1 text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${interactive ? "cursor-pointer hover:scale-110 transition" : ""} ${
            star <= score ? "fill-current" : "text-gray-300 fill-none"
          }`}
          onClick={() => interactive && setRating(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="mt-10 border-t pt-10">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
        نظرات کاربران
        {stats.count > 0 && (
            <span className="text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {stats.average} از ۵ ({stats.count} نظر)
            </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
            {loading ? (
                <Loader2 className="animate-spin text-gray-400" />
            ) : reviews.length === 0 ? (
                <div className="text-gray-500 italic">اولین نفری باشید که نظر می‌دهید!</div>
            ) : (
                reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white border rounded-full flex items-center justify-center text-gray-400">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-800">{rev.user_name}</p>
                                    <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString('fa-IR')}</span>
                                </div>
                            </div>
                            {renderStars(rev.rating)}
                        </div>
                        <p className="text-gray-600 text-sm mt-2">{rev.comment}</p>
                    </div>
                ))
            )}
        </div>

        <div className="bg-white border rounded-xl p-6 h-fit shadow-sm">
            <h3 className="font-bold mb-4">دیدگاه خود را ثبت کنید</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">امتیاز شما</label>
                    {renderStars(rating, true)}
                </div>
                <input 
                    className="w-full border p-2 rounded-lg text-sm" 
                    placeholder="نام شما *" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                />
                <textarea 
                    className="w-full border p-2 rounded-lg text-sm min-h-[100px]" 
                    placeholder="نظر شما..." 
                    value={comment} 
                    onChange={e => setComment(e.target.value)} 
                />
                <Button type="submit" disabled={submitting} className="w-full bg-black text-white hover:bg-gray-800">
                    {submitting ? "در حال ارسال..." : "ارسال نظر"}
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}