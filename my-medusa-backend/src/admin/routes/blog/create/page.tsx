import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // استایل ویرایشگر
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";


export default function CreateBlogPost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // استیت فرم
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    seo_title: "",
    seo_desc: "",
    category: "",
    status: "draft",
    excerpt: "",
    image: "",
    content: "", // متن اصلی مقاله
  });


  useEffect(() => {
    fetch("/admin/blog-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  // هندل کردن آپلود عکس (با استفاده از API اختصاصی خودمان)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const payload = new FormData();
    payload.append("files", file);

    try {
      const res = await fetch("/admin/custom-uploads", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (data.uploads?.[0]?.url) {
        setFormData({ ...formData, image: data.uploads[0].url });
      }
    } catch (err) {
      alert("خطا در آپلود تصویر");
    }
  };

  // ارسال فرم به بک‌اند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("مقاله با موفقیت ذخیره شد!");
        navigate("/blog"); // بازگشت به لیست
      } else {
        const err = await res.json();
        alert("خطا: " + err.message);
      }
    } catch (error) {
      console.error(error);
      alert("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      {/* هدر */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/blog")} className="text-gray-500 hover:text-black">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">نوشتن مقاله جدید</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون راست (محتوای اصلی) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* عنوان */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">عنوان مقاله</label>
            <input
              required
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="مثال: راهنمای انتخاب لباس مجلسی"
            />
          </div>

          {/* ویرایشگر متن */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">متن کامل مقاله</label>
            <div className="h-96 mb-12"> {/* ارتفاع فیکس برای ادیتور */}
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={(value) => setFormData({...formData, content: value})}
                className="h-full"
              />
            </div>
          </div>

          {/* سئو */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">تنظیمات سئو (SEO)</h3>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">آدرس URL (Slug)</label>
              <input
                required
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg ltr text-left font-mono text-sm"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="how-to-choose-dress"
              />
              <p className="text-xs text-gray-400 mt-1">فقط حروف انگلیسی و خط تیره (-)</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">توضیحات متا (Description)</label>
              <textarea
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.seo_desc}
                onChange={(e) => setFormData({...formData, seo_desc: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* ستون چپ (تنظیمات کناری) */}
        <div className="space-y-6">
          
          {/* انتشار */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">وضعیت</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
            </select>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>

          {/* تصویر شاخص */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-4">تصویر شاخص</label>
            
            {formData.image ? (
              <div className="relative mb-4 group">
                <img src={formData.image} className="w-full h-48 object-cover rounded-lg" />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, image: ""})}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                بدون تصویر
              </div>
            )}

            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* دسته‌بندی */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">دسته‌بندی</label>
            {/* 👇 شروع کد جدید (سلکت باکس) */}
<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
  <div className="flex justify-between items-center mb-2">
    <label className="block text-sm font-medium">دسته‌بندی</label>
    <button 
      type="button" 
      onClick={() => navigate("/blog/categories")}
      className="text-xs text-blue-600 hover:underline"
    >
      + مدیریت دسته‌بندی‌ها
    </button>
  </div>
  
  <select
    className="w-full p-2 border border-gray-300 rounded-lg"
    value={formData.category || ""}
    onChange={(e) => setFormData({...formData, category: e.target.value})}
  >
    <option value="">انتخاب کنید...</option>
    {categories.map((cat: any) => (
      <option key={cat.id} value={cat.title}>
        {cat.title}
      </option>
    ))}
  </select>
</div>
{/* 👆 پایان کد جدید */}
          </div>

          {/* خلاصه متن */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">خلاصه متن (Excerpt)</label>
            <textarea
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              placeholder="متنی که در کارت مقاله نمایش داده می‌شود..."
            />
          </div>

        </div>
      </form>
    </div>
  );
}