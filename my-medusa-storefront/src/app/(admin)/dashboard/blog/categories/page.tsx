"use client";

import { useState, useEffect } from "react";
import { getCategories, createCategory, deleteCategory, updateCategory } from "./actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Tag, Loader2, Edit } from "lucide-react"; 
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // استیت برای نگهداری دسته‌بندی در حال ویرایش
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // لود اولیه
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }

  // باز کردن مودال برای ساخت جدید
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setOpen(true);
  }

  // باز کردن مودال برای ویرایش
  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setOpen(true);
  }

  // هندل کردن فرم (مشترک)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionLoading(true);
    
    const formData = new FormData(e.currentTarget);
    let res;

    if (editingCategory) {
        res = await updateCategory(editingCategory.id, formData);
    } else {
        res = await createCategory(formData);
    }

    if (res.success) {
      toast.success(editingCategory ? "ویرایش شد" : "ساخته شد");
      setOpen(false);
      loadData(); // رفرش لیست
    } else {
      toast.error(res.error || "خطا در عملیات");
    }
    setActionLoading(false);
  }

  // هندل کردن حذف
  async function handleDelete(id: string) {
    if(!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
    
    // حالت لودینگ موقت برای UI بهتر (اختیاری)
    const originalCategories = [...categories];
    setCategories(categories.filter(c => c.id !== id));

    const res = await deleteCategory(id);
    if (res.success) {
      toast.success("حذف شد");
      // نیاز به لود مجدد نیست چون دستی آپدیت کردیم، اما برای اطمینان می‌توان صدا زد:
      // loadData(); 
    } else {
      toast.error("خطا در حذف");
      setCategories(originalCategories); // بازگرداندن حالت قبل در صورت خطا
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">دسته‌بندی‌ها</h1>
           <p className="text-gray-500 mt-1">مدیریت موضوعات وبلاگ</p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" /> افزودن جدید
        </Button>

        {/* مودال */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right mr-4 text-gray-800">
                {editingCategory ? "ویرایش دسته‌بندی" : "ساخت دسته‌بندی جدید"}
              </DialogTitle>
            </DialogHeader>
            
            <form 
                key={editingCategory ? editingCategory.id : "new"} 
                onSubmit={handleSubmit} 
                className="grid gap-4 py-4"
            >
              <div className="grid gap-2">
                <Label className="text-right">عنوان نمایشی</Label>
                <Input 
                    name="title" 
                    defaultValue={editingCategory?.title || ""} 
                    placeholder="مثلاً: اخبار تکنولوژی" 
                    required 
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-right">شناسه (Value)</Label>
                <Input 
                    name="value" 
                    defaultValue={editingCategory?.value || ""} 
                    placeholder="news-tech" 
                    className="text-left dir-ltr" 
                    required 
                />
                <p className="text-xs text-gray-400">شناسه باید انگلیسی و یکتا باشد.</p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={actionLoading} className="w-full sm:w-auto">
                  {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : (editingCategory ? "ذخیره تغییرات" : "ساختن")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
             <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="h-12 px-6 font-medium text-gray-500">عنوان</th>
                    <th className="h-12 px-6 font-medium text-gray-500">شناسه (Value)</th>
                    <th className="h-12 px-6 font-medium text-gray-500 w-[120px]">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                     <tr><td colSpan={3} className="p-4 text-center text-gray-500">در حال بارگذاری...</td></tr>
                  ) : categories.length === 0 ? (
                     <tr><td colSpan={3} className="p-8 text-center text-gray-500">دسته بندی وجود ندارد</td></tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium flex items-center gap-2 text-gray-900">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                             <Tag className="w-4 h-4" />
                           </div>
                           {cat.title}
                        </td>
                        <td className="p-4 text-gray-500 font-mono text-xs">{cat.value}</td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="text-blue-600 hover:bg-blue-50"
                                 onClick={() => handleOpenEdit(cat)}
                               >
                                 <Edit className="w-4 h-4" />
                               </Button>

                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="text-red-500 hover:bg-red-50"
                                 onClick={() => handleDelete(cat.id)}
                               >
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}