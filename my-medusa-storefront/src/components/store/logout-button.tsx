"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // ✅ درخواست به روت داخلی خودمان برای حذف کوکی‌ها
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("با موفقیت خارج شدید");
        // رفرش کردن روتر برای اعمال تغییرات کوکی
        router.refresh(); 
        // هدایت به صفحه ورود
        router.push("/account/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در خروج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout} 
      disabled={loading}
      className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      خروج از حساب
    </Button>
  );
}