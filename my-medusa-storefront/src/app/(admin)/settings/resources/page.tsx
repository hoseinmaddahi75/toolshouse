"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

const BASE_URL = MEDUSA_BACKEND_URL;

export default function ResourcesPage() {
  // --- State برای راهنمای سایز ---
  const [sizeTitle, setSizeTitle] = useState("");
  const [sizeUrl, setSizeUrl] = useState("");
  
  // --- State برای الگوهای مشخصات ---
  const [specTitle, setSpecTitle] = useState("");
  const [specFields, setSpecFields] = useState(""); // ورودی متنی که با کاما جدا می‌شوند

  const createSizeGuide = async () => {
    try {
      await fetch(`${BASE_URL}/admin/product-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sizes", title: sizeTitle, data: sizeUrl }),
        credentials: "include"
      });
      toast.success("راهنمای سایز ساخته شد");
      setSizeTitle(""); setSizeUrl("");
    } catch (e) { toast.error("خطا"); }
  };

  const createSpecTemplate = async () => {
    try {
      // تبدیل رشته "رم، هارد" به آرایه ["رم", "هارد"]
      const fieldsArray = specFields.split("،").map(s => s.trim()).filter(Boolean);
      
      await fetch(`${BASE_URL}/admin/product-resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "specs", title: specTitle, data: fieldsArray }),
        credentials: "include"
      });
      toast.success("الگوی مشخصات ساخته شد");
      setSpecTitle(""); setSpecFields("");
    } catch (e) { toast.error("خطا"); }
  };

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-2xl font-bold">مدیریت منابع محصول</h1>

      {/* بخش راهنمای سایز */}
      <div className="border p-6 rounded-xl bg-white space-y-4">
        <h2 className="font-bold text-lg">۱. تعریف راهنمای سایز جدید</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="عنوان (مثلا: تیشرت مردانه)" value={sizeTitle} onChange={e => setSizeTitle(e.target.value)} />
          <Input placeholder="لینک تصویر (URL)" value={sizeUrl} onChange={e => setSizeUrl(e.target.value)} dir="ltr" />
        </div>
        <Button onClick={createSizeGuide}>ذخیره راهنمای سایز</Button>
      </div>

      {/* بخش الگوی مشخصات */}
      <div className="border p-6 rounded-xl bg-white space-y-4">
        <h2 className="font-bold text-lg">۲. تعریف الگوی جدول مشخصات</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="عنوان الگو (مثلا: لپ‌تاپ)" value={specTitle} onChange={e => setSpecTitle(e.target.value)} />
          <Input 
            placeholder="فیلدها (با کاما فارسی '،' جدا کنید. مثلا: رم، هارد، گرافیک)" 
            value={specFields} 
            onChange={e => setSpecFields(e.target.value)} 
          />
        </div>
        <Button onClick={createSpecTemplate}>ذخیره الگو</Button>
      </div>
    </div>
  );
}