"use client";

import { useState } from "react";
import dynamic from "next/dynamic"; // برای لود کردن Quill
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { savePostAction } from "@/app/(admin)/dashboard/blog/create/actions";
import Image from "next/image";
import "react-quill-new/dist/quill.snow.css"; // استایل ادیتور

// لود کردن ادیتور به صورت Dynamic (چون SSR ساپورت نمیکنه)
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface PostFormProps {
  categories: any[];
  initialData?: any; // اگر باشد یعنی حالت ویرایش است
}

export default function PostForm({ categories, initialData }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || "");

  // هندل کردن انتخاب فایل تصویر
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    
    // اضافه کردن دستی محتوای ادیتور به فرم‌دیتا
    formData.append("content", content);
    formData.append("category", selectedCategory);
    
    // اگر در حالت ویرایش هستیم، تصویر قبلی را نگه داریم مگر اینکه عوض شده باشد
    if (initialData?.image) {
        formData.append("existing_image", initialData.image);
    }

    const isEdit = !!initialData;
    const result = await savePostAction(formData, isEdit, initialData?.id);

    if (result?.error) {
        toast.error(result.error);
        setLoading(false);
    } else {
        toast.success(isEdit ? "پست ویرایش شد" : "پست منتشر شد");
        // ریدایرکت خودکار انجام میشه
    }
  };

  return (
    <form action={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ستون اصلی (چپ) */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>محتوای مقاله</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>عنوان مقاله</Label>
                            <Input name="title" required defaultValue={initialData?.title} placeholder="عنوان جذاب..." />
                        </div>
                        
                        <div className="space-y-2 dir-ltr">
                            <Label className="text-right block mb-2">متن کامل</Label>
                            <div className="bg-white text-black rounded-md overflow-hidden">
                                <ReactQuill 
                                    theme="snow" 
                                    value={content} 
                                    onChange={setContent} 
                                    className="h-[300px] mb-12" // mb-12 برای تولبار پایین
                                    modules={{
                                        toolbar: [
                                          [{ 'header': [1, 2, 3, false] }],
                                          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                          [{'list': 'ordered'}, {'list': 'bullet'}],
                                          ['link', 'image'],
                                          ['clean']
                                        ],
                                      }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>سئو و متادیتای اضافی</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>عنوان سئو (SEO Title)</Label>
                            <Input name="seo_title" defaultValue={initialData?.seo_title} placeholder="اگر خالی باشد، عنوان اصلی استفاده می‌شود" />
                        </div>
                        <div className="space-y-2">
                            <Label>چکیده (Excerpt)</Label>
                            <Textarea name="excerpt" defaultValue={initialData?.excerpt} placeholder="متنی کوتاه برای نمایش در لیست بلاگ..." />
                        </div>
                        <div className="space-y-2">
                            <Label>توضیحات متا (SEO Description)</Label>
                            <Textarea name="seo_desc" defaultValue={initialData?.seo_desc} placeholder="توضیحاتی که در گوگل نمایش داده می‌شود..." />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ستون تنظیمات (راست) */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>تنظیمات انتشار</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin ml-2" /> : <Save className="ml-2 w-4 h-4" />}
                            {loading ? "در حال پردازش..." : (initialData ? "ذخیره تغییرات" : "انتشار")}
                        </Button>

                        <div className="space-y-2">
                            <Label>وضعیت</Label>
                            <Select name="status" defaultValue={initialData?.status || "published"} dir="rtl">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="published">منتشر شده</SelectItem>
                                    <SelectItem value="draft">پیش‌نویس</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>نامک (Slug)</Label>
                            <Input name="slug" required defaultValue={initialData?.slug} className="dir-ltr text-left" />
                        </div>

                        <div className="space-y-2">
                            <Label>دسته‌بندی</Label>
                            <Select onValueChange={setSelectedCategory} value={selectedCategory} dir="rtl">
                                <SelectTrigger><SelectValue placeholder="انتخاب کنید..." /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.value || cat.title}>{cat.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                            <Label>تصویر شاخص</Label>
                            
                            {/* کادر انتخاب تصویر */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                <input 
                                    type="file" 
                                    name="image_file" 
                                    accept="image/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                {imagePreview ? (
                                    <div className="relative w-full h-40">
                                        {/* اگر لینک خارجی است یا فایل لوکال */}
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                        <div className="absolute top-1 right-1 bg-white rounded-full p-1 cursor-pointer" onClick={(e)=>{
                                            e.preventDefault(); setImagePreview(null);
                                        }}>
                                            <X className="w-4 h-4 text-red-500" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <ImagePlus className="w-8 h-8 mb-2" />
                                        <span className="text-sm">کلیک برای انتخاب تصویر</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    </form>
  );
}