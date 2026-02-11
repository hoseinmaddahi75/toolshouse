import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function EditBlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // استیت لیست دسته‌بندی‌ها
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    seo_title: "",
    seo_desc: "",
    category: "",
    status: "draft",
    excerpt: "",
    image: "",
    content: "",
  });

  useEffect(() => {
    // 1. دریافت اطلاعات مقاله
    const fetchPost = fetch(`/admin/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setFormData(data.post);
        } else {
          alert("مقاله یافت نشد!");
          navigate("/blog");
        }
      });

    // 2. دریافت لیست دسته‌بندی‌ها
    const fetchCats = fetch("/admin/blog-categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));

    // وقتی هر دو تمام شد، لودینگ را بردار
    Promise.all([fetchPost, fetchCats])
      .catch((err) => console.error(err))
      .finally(() => setFetching(false));
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/admin/blog/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("مقاله با موفقیت ویرایش شد!");
        navigate("/blog");
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

  if (fetching) return <div className="p-8">در حال دریافت اطلاعات...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/blog")} className="text-gray-500 hover:text-black">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">ویرایش مقاله</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ستون راست */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">عنوان مقاله</label>
            <input
              required
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">متن کامل مقاله</label>
            <div className="h-96 mb-12">
              <ReactQuill 
                theme="snow"
                value={formData.content || ""}
                onChange={(value) => setFormData({...formData, content: value})}
                className="h-full"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">تنظیمات سئو</h3>
            <div>
              <label className="block text-sm text-gray-600 mb-1">آدرس URL (Slug)</label>
              <input
                required
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg ltr text-left font-mono text-sm"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">توضیحات متا</label>
              <textarea
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={formData.seo_desc || ""}
                onChange={(e) => setFormData({...formData, seo_desc: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* ستون چپ */}
        <div className="space-y-6">
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
              {loading ? "در حال ذخیره..." : "بروزرسانی مقاله"}
            </button>
          </div>

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
              className="block w-full text-sm text-gray-500"
            />
          </div>

          {/* 👇 بخش دسته‌بندی جدید (سلکت باکس) */}
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

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium mb-2">خلاصه متن</label>
            <textarea
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              value={formData.excerpt || ""}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            />
          </div>
        </div>
      </form>
    </div>
  );
}