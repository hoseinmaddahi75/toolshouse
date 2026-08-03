// src/components/admin/attributes-management.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Edit2, Loader2, X, Layers, Save 
} from "lucide-react";
import { toast } from "sonner";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// تایپ‌ها
type AttributeValue = { id: string; value: string };
type Attribute = { id: string; title: string; values: AttributeValue[]; };

// 👇 دریافت توکن
export default function AttributesManagement({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const BASE_URL = MEDUSA_BACKEND_URL;

  // هدر احراز هویت
  const authHeaders = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formValues, setFormValues] = useState<string[]>([]);
  const [newValueInput, setNewValueInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      // 👇 استفاده از هدر Auth
      const res = await fetch(`${BASE_URL}/admin/global-attributes`, {
          headers: authHeaders,
          credentials: "include"
      });
      
      if (res.status === 401) {
          toast.error("نشست کاربری منقضی شده است");
          return;
      }

      if (res.ok) {
        const data = await res.json();
        setAttributes(data.attributes || data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت ویژگی‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAttributes();
  }, [token]);

  const openModal = (attr?: Attribute) => {
    if (attr) {
      setEditingAttr(attr);
      setFormTitle(attr.title);
      setFormValues(attr.values.map(v => v.value));
    } else {
      setEditingAttr(null);
      setFormTitle("");
      setFormValues([]);
    }
    setNewValueInput("");
    setIsModalOpen(true);
  };

  const handleAddValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = newValueInput.trim();
      if (val && !formValues.includes(val)) {
        setFormValues([...formValues, val]);
        setNewValueInput("");
      }
    }
  };

  const removeValue = (valToRemove: string) => {
    setFormValues(prev => prev.filter(v => v !== valToRemove));
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این ویژگی اطمینان دارید؟")) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/global-attributes/${id}`, {
        method: "DELETE",
        headers: authHeaders,
        credentials: "include"
      });
      const data = await res.json(); 

      if (res.ok) {
        toast.success("ویژگی حذف شد");
        setAttributes(prev => prev.filter(a => a.id !== id));
      } else {
        toast.error(data.message || "خطا در حذف ویژگی");
      }
    } catch (e) { toast.error("خطا در ارتباط با سرور"); }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return toast.error("عنوان ویژگی الزامی است");
    if (formValues.length === 0) return toast.error("حداقل یک مقدار وارد کنید");

    setSubmitting(true);
    try {
      const payload = { title: formTitle, values: formValues };
      let url = `${BASE_URL}/admin/global-attributes`;
      
      if (editingAttr) {
        url = `${BASE_URL}/admin/global-attributes/${editingAttr.id}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطا در ذخیره سازی");
      }

      toast.success(editingAttr ? "ویژگی ویرایش شد" : "ویژگی جدید ساخته شد");
      setIsModalOpen(false);
      fetchAttributes();

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7" /> ویژگی‌های محصولات
          </h1>
          <p className="text-gray-500 mt-1">مدیریت ویژگی‌های سراسری مثل رنگ، سایز و جنس</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black hover:bg-gray-800 text-white gap-2">
          <Plus className="w-4 h-4" /> افزودن ویژگی
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>
      ) : attributes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">هنوز هیچ ویژگی‌ای تعریف نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attributes.map((attr) => (
            <div key={attr.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{attr.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(attr)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(attr.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">{val.value}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-400 flex justify-between">
                <span>{attr.values.length} مقدار</span>
                <span className="font-mono">{attr.id.substring(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">{editingAttr ? "ویرایش ویژگی" : "افزودن ویژگی جدید"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان ویژگی</label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="مثلا: رنگ" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مقادیر</label>
                <div className="relative">
                  <Input value={newValueInput} onChange={e => setNewValueInput(e.target.value)} onKeyDown={handleAddValue} placeholder="تایپ کنید و Enter بزنید" className="pr-10" />
                  <div className="absolute left-3 top-2.5"><span className="text-[10px] text-gray-400 border border-gray-200 px-1 rounded">Enter ⏎</span></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {formValues.map((val, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded text-sm shadow-sm animate-in fade-in zoom-in">
                      {val}
                      <button onClick={() => removeValue(val)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>لغو</Button>
              <Button onClick={handleSave} disabled={submitting} className="bg-black text-white min-w-[100px]">
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4 mr-2" />}
                {editingAttr ? "ذخیره تغییرات" : "ساخت ویژگی"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}