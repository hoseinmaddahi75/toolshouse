"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAddressAction } from "./actions";
import { toast } from "sonner";

export default function DeleteAddressButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // یک تایید ساده از کاربر می‌گیریم
    if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;

    setLoading(true);
    const res = await deleteAddressAction(id);
    setLoading(false);

    if (res.success) {
      toast.success("آدرس با موفقیت حذف شد");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDelete}
        disabled={loading}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 gap-2"
    >
        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />} 
        حذف
    </Button>
  );
}