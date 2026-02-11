import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRightIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const config = defineRouteConfig({
  label: "Blog",
  icon: ChatBubbleLeftRightIcon,
});

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // لیست آیتم‌های انتخاب شده

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    fetch("/admin/blog")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  // حذف تکی
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این مقاله مطمئن هستید؟")) return;
    await fetch(`/admin/blog/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p: any) => p.id !== id));
  };

  // مدیریت انتخاب چک‌باکس‌ها
  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // انتخاب همه
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(posts.map((p: any) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  // حذف گروهی
  const handleBulkDelete = async () => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید ${selectedIds.length} مقاله را حذف کنید؟`)) return;

    // ارسال درخواست حذف برای همه آیدی‌های انتخاب شده به صورت موازی
    await Promise.all(
      selectedIds.map(id => fetch(`/admin/blog/${id}`, { method: "DELETE" }))
    );

    // رفرش لیست و خالی کردن انتخاب‌ها
    fetchPosts();
    setSelectedIds([]);
  };

  return (
    <div className="p-8">
      {/* هدر صفحه */}
<div className="flex justify-between items-center mb-6">
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold text-gray-900">مدیریت وبلاگ</h1>
    
    {/* دکمه حذف گروهی */}
    {selectedIds.length > 0 && (
      <button 
        onClick={handleBulkDelete}
        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 flex items-center gap-2 transition-all animate-fadeIn"
      >
        <TrashIcon className="w-4 h-4" />
        حذف ({selectedIds.length})
      </button>
    )}
  </div>

  {/* 👇 این بخش دکمه‌ها را اصلاح کردیم: هر دو داخل یک div با gap-3 */}
  <div className="flex items-center gap-3">
    <Link 
      to="/blog/categories" 
      className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
    >
      مدیریت دسته‌بندی‌ها
    </Link>
    
    <Link 
      to="/blog/create" 
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
    >
      <PlusIcon className="w-5 h-5" />
      نوشته جدید
    </Link>
  </div>
</div>

      {/* جدول لیست */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="w-12 px-6 py-4">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 w-4 h-4 focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={posts.length > 0 && selectedIds.length === posts.length}
                />
              </th>
              <th className="px-6 py-4 font-medium">تصویر</th>
              <th className="px-6 py-4 font-medium">عنوان</th>
              <th className="px-6 py-4 font-medium">وضعیت</th>
              <th className="px-6 py-4 font-medium">تاریخ انتشار</th>
              <th className="px-6 py-4 font-medium text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map((post: any) => (
              <tr key={post.id} className={`transition-colors ${selectedIds.includes(post.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <td className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 w-4 h-4 focus:ring-blue-500"
                    checked={selectedIds.includes(post.id)}
                    onChange={() => handleSelect(post.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  {post.image ? (
                    <img src={post.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">📷</div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <Link to={`/blog/${post.id}`} className="hover:text-blue-600 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(post.published_at).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {/* دکمه ویرایش (فعال شد) */}
                    <Link to={`/blog/${post.id}`} className="text-gray-400 hover:text-blue-600" title="ویرایش">
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                    
                    <button 
                      onClick={() => handleDelete(post.id)} 
                      className="text-gray-400 hover:text-red-600"
                      title="حذف"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  هنوز مقاله‌ای نوشته نشده است.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}