"use client";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePostAction } from "@/app/(admin)/dashboard/blog/create/actions";
import { useState } from "react";
import { toast } from "sonner";

export default function DeletePostButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if(!confirm("آیا از حذف این مقاله مطمئن هستید؟")) return;
        setLoading(true);
        const res = await deletePostAction(id);
        if(res.success) {
            toast.success("حذف شد");
        } else {
            toast.error("خطا در حذف");
        }
        setLoading(false);
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-500 hover:bg-red-50"
            onClick={handleDelete}
            disabled={loading}
            type="button"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    );
}