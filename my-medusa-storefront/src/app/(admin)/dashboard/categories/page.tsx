"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FolderPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  FolderIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";

interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description: string;
  is_active: boolean;
  is_internal: boolean;
  parent_category_id: string | null;
  created_at: string;
  updated_at: string;
  rank?: number;
}

interface CategoryTreeNode extends ProductCategory {
  level: number;
  children?: CategoryTreeNode[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    description: "",
    is_active: true,
    is_internal: false,
    parent_category_id: ""
  });

  const fetchCategories = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_82b953b964ad71f051bb02d1382200901c260d0e8628f845fd00856125b14336";
      
      const res = await fetch(`${backendUrl}/store/product-categories?limit=1000`, {
        credentials: "include",
        headers: {
          "x-publishable-api-key": publishableKey,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`API Error: ${res.status} - ${errorData}`);
      }
      
      const data = await res.json();
      setCategories(data.product_categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const organizedCategories = useMemo(() => {
    const buildTree = (cats: ProductCategory[], parentId: string | null = null, level = 0): CategoryTreeNode[] => {
      return cats
        .filter(c => c.parent_category_id === parentId)
        .map(c => {
            const children = buildTree(cats, c.id, level + 1);
            return [
                { ...c, level },
                ...children
            ];
        })
        .flat();
    };
    return buildTree(categories);
  }, [categories]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      handle: "",
      description: "",
      is_active: true,
      is_internal: false,
      parent_category_id: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      handle: cat.handle,
      description: cat.description || "",
      is_active: cat.is_active,
      is_internal: cat.is_internal,
      parent_category_id: cat.parent_category_id || ""
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingId) {
      const generatedHandle = name.trim().toLowerCase().replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, name, handle: generatedHandle }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("برای ایجاد یا ویرایش دسته‌بندی‌ها، لطفا از پنل ادمین مدوسا استفاده کنید.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟ تمام زیردسته‌های آن هم حذف یا یتیم خواهند شد.")) return;
    alert("برای حذف دسته‌بندی‌ها، لطفا از پنل ادمین مدوسا استفاده کنید.");
  };

  if (loading && !isModalOpen && categories.length === 0) return <div className="p-10 text-center text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderIcon className="w-8 h-8 text-[#B19276]" />
            دسته‌بندی محصولات
          </h1>
          <p className="text-gray-500 text-sm mt-1">مدیریت ساختار درختی فروشگاه</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-[#B19276] transition-colors shadow-lg shadow-black/10"
        >
          <FolderPlusIcon className="w-5 h-5" />
          افزودن دسته جدید
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[800px]">
            <thead className="bg-gray-100 text-gray-600 text-sm border-b border-gray-200">
                <tr>
                <th className="p-4 w-[40%]">نام دسته‌بندی (ساختار درختی)</th>
                <th className="p-4">شناسه (Handle)</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-left">عملیات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {organizedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                        <div className="flex items-center" style={{ marginRight: `${cat.level * 24}px` }}>
                            {cat.level > 0 && (
                                <span className="text-gray-300 ml-2 border-b-2 border-l-2 border-gray-300 w-4 h-4 rounded-bl-lg inline-block"></span>
                            )}
                            <div className="flex flex-col">
                                <span className={`text-gray-800 ${cat.level === 0 ? 'font-bold' : 'font-medium'}`}>
                                    {cat.name}
                                </span>
                                {cat.description && (
                                    <span className="text-xs text-gray-400 truncate max-w-[200px]">{cat.description}</span>
                                )}
                            </div>
                        </div>
                    </td>

                    <td className="p-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 font-mono dir-ltr block w-fit">
                            /{cat.handle}
                        </code>
                    </td>

                    <td className="p-4">
                        <div className="flex gap-2">
                            {cat.is_active ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">فعال</span>
                            ) : (
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs border border-gray-200">غیرفعال</span>
                            )}
                            {cat.is_internal && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs border border-purple-200">داخلی</span>
                            )}
                        </div>
                    </td>
                    
                    <td className="p-4">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openEditModal(cat)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                title="ویرایش"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                title="حذف"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {categories.length === 0 && !loading && (
          <div className="p-16 text-center flex flex-col items-center justify-center text-gray-400">
             <FolderIcon className="w-16 h-16 mb-4 text-gray-200" />
             <p>هیچ دسته‌بندی وجود ندارد.</p>
             <button onClick={openCreateModal} className="mt-4 text-[#B19276] hover:underline">اولین دسته را بسازید</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-lg p-0 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "ویرایش دسته‌بندی" : "ساخت دسته‌بندی جدید"}
                </h2>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">نام دسته‌بندی <span className="text-red-500">*</span></label>
                  <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="مثلاً: ابزار برقی"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B19276] focus:ring-1 focus:ring-[#B19276] transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">شناسه URL (Handle) <span className="text-red-500">*</span></label>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                      <input 
                      type="text" 
                      required
                      value={formData.handle}
                      onChange={(e) => setFormData({...formData, handle: e.target.value})}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B19276] font-mono text-sm dir-ltr text-right bg-gray-50"
                      />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">دسته‌بندی والد (زیرمجموعه کدام دسته باشد؟)</label>
                <div className="relative">
                    <select 
                    value={formData.parent_category_id}
                    onChange={(e) => setFormData({...formData, parent_category_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B19276] bg-white appearance-none"
                    >
                    <option value="">-- بدون والد (ریشه اصلی) --</option>
                    {organizedCategories.map((cat) => (
                        cat.id !== editingId && (
                        <option key={cat.id} value={cat.id}>
                            {" a0".repeat(cat.level * 4) + (cat.level > 0 ? "↳ " : "") + cat.name}
                        </option>
                        )
                    ))}
                    </select>
                    <ChevronLeftIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B19276]"
                />
              </div>

              <div className="flex gap-6 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.is_active ? 'bg-[#B19276] border-[#B19276]' : 'bg-white border-gray-300'}`}>
                     {formData.is_active && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-black">قابل نمایش در سایت (Active)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none group">
                   <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.is_internal ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                     {formData.is_internal && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                   </div>
                   <input 
                     type="checkbox" 
                     className="hidden"
                     checked={formData.is_internal}
                     onChange={(e) => setFormData({...formData, is_internal: e.target.checked})}
                   />
                   <span className="text-sm text-gray-700 group-hover:text-black">فقط داخلی (Internal)</span>
                </label>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-[#B19276] transition-colors flex justify-center items-center gap-2"
                >
                  {editingId ? "بروزرسانی" : "ساخت دسته‌بندی"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}