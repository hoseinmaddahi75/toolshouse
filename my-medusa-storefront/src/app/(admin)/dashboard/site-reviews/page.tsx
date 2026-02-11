"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Loader2, Trash2, Plus, Edit, Star, 
  Upload, X, MessageSquareQuote, User, Briefcase 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSiteReviews, saveSiteReviewAction, deleteSiteReviewAction, uploadReviewImage } from "./actions"; // 👈 ایمپورت اکشن‌ها

// تایپ داده‌ها
type SiteReview = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string | null;
  created_at: string;
};

export default function SiteReviewsPage() {
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [loading, setLoading] = useState(true);

  // --- State های مودال و فرم ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      role: "",
      content: "",
      rating: 5,
      image: ""
  });

  // 1. دریافت لیست
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getSiteReviews();
      setReviews(data);
    } catch (e) {
      toast.error("خطا در دریافت نظرات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. هندلر آپلود تصویر
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const uploadForm = new FormData();
      uploadForm.append("files", file);

      const tId = toast.loading("در حال آپلود تصویر...");
      const res = await uploadReviewImage(uploadForm);
      
      toast.dismiss(tId);
      if (res.success) {
        setFormData(prev => ({ ...prev, image: res.url }));
        toast.success("تصویر بارگذاری شد");
      } else {
        toast.error("خطا در آپلود تصویر");
      }
    }
  };

  // 3. ذخیره
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await saveSiteReviewAction(formData, editingId || undefined);

    if (res.success) {
      toast.success(editingId ? "نظر ویرایش شد" : "نظر جدید ایجاد شد");
      closeModal();
      loadData(); // رفرش لیست
    } else {
      toast.error(res.error || "خطا در ذخیره‌سازی");
    }
    
    setIsSubmitting(false);
  };

  // 4. حذف
  const handleDelete = async (id: string) => {
    if(!confirm("آیا از حذف این مورد اطمینان دارید؟")) return;
    
    // آپدیت سریع UI
    const original = [...reviews];
    setReviews(prev => prev.filter(r => r.id !== id));

    const res = await deleteSiteReviewAction(id);
    if (res.success) {
        toast.success("حذف شد");
    } else {
        toast.error("خطا در حذف");
        setReviews(original);
    }
  };

  // --- مدیریت مودال ---
  const openNewModal = () => {
      setEditingId(null);
      setFormData({ name: "", role: "", content: "", rating: 5, image: "" });
      setIsModalOpen(true);
  };

  const openEditModal = (review: SiteReview) => {
      setEditingId(review.id);
      setFormData({
          name: review.name,
          role: review.role,
          content: review.content,
          rating: review.rating,
          image: review.image || ""
      });
      setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);


  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-8 pb-20" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">نظرات سایت (Testimonials)</h1>
                <p className="text-sm text-gray-500 mt-1">مدیریت نظراتی که خودتان برای نمایش در صفحه اصلی ثبت می‌کنید</p>
            </div>
        </div>
        <Button onClick={openNewModal} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Plus className="w-4 h-4" /> افزودن نظر جدید
        </Button>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reviews.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                
                {/* Header Card */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                            {item.image ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized/>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-400"><User className="w-6 h-6" /></div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {item.role}</p>
                        </div>
                    </div>
                    <div className="flex bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-xs font-bold gap-1 h-fit">
                        {item.rating} <Star className="w-3 h-3 fill-current" />
                    </div>
                </div>

                {/* Content */}
                <div className="bg-gray-50 p-3 rounded-xl mb-4 min-h-[80px]">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">"{item.content}"</p>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 border-t pt-4 mt-auto">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(item)} className="h-8 text-gray-600 border-gray-200 hover:bg-gray-50">
                        <Edit className="w-3.5 h-3.5 ml-1.5" /> ویرایش
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        ))}
      </div>

      {reviews.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-400">هنوز هیچ نظری ثبت نکرده‌اید.</p>
          </div>
      )}


      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-lg font-bold text-gray-900">{editingId ? "ویرایش نظر" : "افزودن نظر جدید"}</h3>
                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    {/* تصویر */}
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                            {formData.image ? (
                                <Image src={formData.image} alt="preview" fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-300"><User className="w-8 h-8" /></div>
                            )}
                        </div>
                        <label className="flex-1 cursor-pointer">
                            <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors text-sm text-gray-500">
                                <Upload className="w-5 h-5 mb-1 text-indigo-500" />
                                <span>آپلود تصویر پروفایل</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">نام و نام خانوادگی</label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="مثلا: علی رضایی" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-700 block mb-1.5">نقش / سمت</label>
                            <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="مثلا: مدیر مارکتینگ" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">امتیاز (۱ تا ۵)</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({...formData, rating: star})}
                                    className={`p-1 transition-transform hover:scale-110 ${star <= formData.rating ? "text-yellow-400" : "text-gray-200"}`}
                                >
                                    <Star className="w-6 h-6 fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1.5">متن نظر</label>
                        <Textarea 
                            value={formData.content} 
                            onChange={e => setFormData({...formData, content: e.target.value})} 
                            required 
                            placeholder="متن نظر مشتری را اینجا بنویسید..." 
                            className="h-28 resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={closeModal}>انصراف</Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : (editingId ? "ذخیره تغییرات" : "ایجاد نظر")}
                    </Button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
}