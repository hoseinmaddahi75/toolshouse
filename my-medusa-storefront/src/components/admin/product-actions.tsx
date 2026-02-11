"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ProductActionsProps {
  id: string;
}

export default function ProductActions({ id }: ProductActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

  const handleDelete = async () => {
    // تاییدیه ساده از کاربر
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟ این عملیات قابل بازگشت نیست.")) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("خطا در حذف محصول");

      toast.success("محصول با موفقیت حذف شد");
      router.refresh(); // رفرش کردن صفحه برای حذف سطر از جدول
    } catch (error) {
      console.error(error);
      toast.error("مشکلی در حذف محصول پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      {/* دکمه ویرایش (لینک به صفحه ویرایش که بعدا می‌سازیم) */}
      <Link href={`/dashboard/products/${id}/edit`}>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>

      {/* دکمه حذف */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}