// src/components/admin/resources-management.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Edit, Ruler, TableProperties, X, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// 👇 دریافت توکن
export default function ResourcesManagement({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<"specs" | "sizes">("specs");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = MEDUSA_BACKEND_URL;

  // هدر احراز هویت
  const authHeaders = {
    "Authorization": `Bearer ${token}`
  };

  const [specTemplates, setSpecTemplates] = useState<any[]>([]);
  const [sizeGuides, setSizeGuides] = useState<any[]>([]);

  const [specTitle, setSpecTitle] = useState("");
  const [specFields, setSpecFields] = useState(""); 
  const [sizeTitle, setSizeTitle] = useState("");
  const [sizeUrl, setSizeUrl] = useState("");

  const fetchData = async () => {
    try {
      // 👇 استفاده از هدر Auth
      const [specsRes, sizesRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/product-resources?type=specs`, { headers: authHeaders }),
        fetch(`${BASE_URL}/admin/product-resources?type=sizes`, { headers: authHeaders })
      ]);
      
      if (specsRes.status === 401 || sizesRes.status === 401) {
          toast.error("نشست کاربری منقضی شده است");
          return;
      }

      const sData = await specsRes.json();
      const zData = await sizesRes.json();
      
      setSpecTemplates(sData.data || []);
      setSizeGuides(zData.data || []);
    } catch (e) {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const resetForms = () => {
    setEditingId(null);
    setSpecTitle("");
    setSpecFields("");
    setSizeTitle("");
    setSizeUrl("");
    setIsUploading(false);
  }

  const startEditing = (item: any, type: "specs" | "sizes") => {
    setEditingId(item.id);
    if (type === "specs") {
        setSpecTitle(item.title);
        setSpecFields(item.fields.join("، "));
    } else {
        setSizeTitle(item.title);
        setSizeUrl(item.image_url);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("files", file);

    setIsUploading(true);
    try {
        // 👇 آپلود با هدر Auth
        const res = await fetch(`${BASE_URL}/admin/uploads`, { 
            method: "POST", 
            body: formData,
            headers: authHeaders 
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        const uploadedUrl = data.files?.[0]?.url || data.uploads?.[0]?.url; 
        
        if (uploadedUrl) {
            setSizeUrl(uploadedUrl);
            toast.success("تصویر بارگذاری شد");
        }
    } catch (error) {
        console.error(error);
        toast.error("خطا در آپلود تصویر");
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeSelectedImage = () => {
      setSizeUrl("");
  };

  const handleSubmit = async (type: "specs" | "sizes") => {
    const isEditing = !!editingId;
    const method = isEditing ? "PUT" : "POST"; // متد ویرایش را چک کنید، شاید POST باشد
    
    let body: any = { type };

    if (type === "specs") {
        if (!specTitle || !specFields) return toast.error("عنوان و فیلدها الزامی است");
        body.title = specTitle;
        body.data = specFields.split(/[,،]+/).map(s => s.trim()).filter(Boolean);
    } else {
        if (!sizeTitle || !sizeUrl) return toast.error("عنوان و تصویر الزامی است");
        body.title = sizeTitle;
        body.data = sizeUrl;
    }

    if (isEditing) {
        body.id = editingId;
    }

    try {
      // 👇 ارسال فرم با هدر Auth
      const res = await fetch(`${BASE_URL}/admin/product-resources`, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Server Error");
      }

      toast.success(isEditing ? "ویرایش شد" : "ساخته شد");
      resetForms();
      fetchData();
    } catch (e: any) { 
        toast.error(e.message || "خطا در عملیات"); 
    }
  };

  const handleDelete = async (id: string, type: "specs" | "sizes") => {
    if(!confirm("آیا از حذف این مورد اطمینان دارید؟")) return;

    try {
        // 👇 حذف با هدر Auth
        const res = await fetch(`${BASE_URL}/admin/product-resources`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ id, type }),
        });
  
        if (!res.ok) throw new Error();
  
        toast.success("حذف شد");
        if (editingId === id) resetForms();
        fetchData();
      } catch (e) { toast.error("خطا در حذف"); }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 pb-20">
      <h1 className="text-2xl font-bold text-gray-900">مدیریت منابع محصول</h1>

      <div className={`flex border-b ${editingId ? 'pointer-events-none opacity-50' : ''}`}>
        <button onClick={() => {setActiveTab("specs"); resetForms();}} className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "specs" ? "border-black text-black" : "border-transparent text-gray-500"}`}><TableProperties className="w-4 h-4" /> الگوهای مشخصات فنی</button>
        <button onClick={() => {setActiveTab("sizes"); resetForms();}} className={`pb-3 px-6 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "sizes" ? "border-black text-black" : "border-transparent text-gray-500"}`}><Ruler className="w-4 h-4" /> راهنماهای سایز</button>
      </div>

      {activeTab === "specs" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`bg-white p-6 rounded-xl border space-y-4 h-fit transition-all ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
            <div className="flex justify-between items-center"><h3 className="font-bold text-lg">{editingId ? 'ویرایش الگو' : 'تعریف الگوی جدید'}</h3>{editingId && <Button variant="ghost" size="icon" onClick={resetForms}><X className="w-4 h-4"/></Button>}</div>
            <p className="text-xs text-gray-500">مثال: عنوان "لپ‌تاپ"، فیلدها "رم، هارد، گرافیک"</p>
            <Input placeholder="عنوان الگو (مثلا: موبایل)" value={specTitle} onChange={e => setSpecTitle(e.target.value)} />
            <Input placeholder="فیلدها (با کاما جدا کنید)" value={specFields} onChange={e => setSpecFields(e.target.value)} />
            <Button onClick={() => handleSubmit("specs")} className={`w-full text-white ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black'}`}>{editingId ? 'ذخیره تغییرات' : 'افزودن الگو'}</Button>
          </div>
          <div className="space-y-4">
            {specTemplates.map((item) => (
              <div key={item.id} className={`p-4 border rounded-lg bg-gray-50 flex justify-between items-start group transition-all ${editingId === item.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                <div><p className="font-bold text-gray-800">{item.title}</p><div className="flex flex-wrap gap-1 mt-2">{item.fields?.map((f: string, i: number) => (<span key={i} className="text-xs bg-white border px-2 py-1 rounded text-gray-600">{f}</span>))}</div></div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" onClick={() => startEditing(item, "specs")}><Edit className="w-4 h-4 text-blue-600" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, "specs")}><Trash2 className="w-4 h-4 text-red-600" /></Button></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`bg-white p-6 rounded-xl border space-y-4 h-fit transition-all ${editingId ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
            <div className="flex justify-between items-center"><h3 className="font-bold text-lg">{editingId ? 'ویرایش راهنما' : 'آپلود راهنمای سایز'}</h3>{editingId && <Button variant="ghost" size="icon" onClick={resetForms}><X className="w-4 h-4"/></Button>}</div>
            <Input placeholder="عنوان (مثلا: تیشرت)" value={sizeTitle} onChange={e => setSizeTitle(e.target.value)} />
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">تصویر راهنما</label>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {!sizeUrl ? (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-2 text-gray-500">
                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-blue-600" /> : <><ImagePlus className="w-8 h-8" /><span className="text-xs">برای آپلود کلیک کنید</span></>}
                    </div>
                ) : (
                    <div className="relative h-48 w-full border rounded-xl overflow-hidden bg-gray-50 group">
                        <Image src={sizeUrl} alt="Preview" fill className="object-contain" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Button variant="destructive" size="sm" onClick={removeSelectedImage}><Trash2 className="w-4 h-4 mr-2" /> حذف تصویر</Button></div>
                    </div>
                )}
            </div>
            <Button onClick={() => handleSubmit("sizes")} disabled={isUploading} className={`w-full text-white ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black'}`}>{isUploading ? "در حال آپلود..." : (editingId ? 'ذخیره تغییرات' : 'افزودن راهنما')}</Button>
          </div>
          <div className="space-y-4">
            {sizeGuides.map((item) => (
              <div key={item.id} className={`p-4 border rounded-lg bg-gray-50 flex justify-between items-center group transition-all ${editingId === item.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white border rounded overflow-hidden relative flex-shrink-0"><Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="64px" unoptimized /></div>
                    <div><p className="font-bold text-gray-800">{item.title}</p><a href={item.image_url} target="_blank" className="text-xs text-blue-500 truncate block max-w-[200px]">لینک تصویر</a></div>
                </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" onClick={() => startEditing(item, "sizes")}><Edit className="w-4 h-4 text-blue-600" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, "sizes")}><Trash2 className="w-4 h-4 text-red-600" /></Button></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}