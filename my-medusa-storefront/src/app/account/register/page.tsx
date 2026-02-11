"use client";

import { useState } from "react";
// ✅ نکته کلیدی: ایمپورت اکشن سرور (نه medusaClient)
import { registerCustomerAction } from "./actions"; 
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleRegisterClick = async () => {
    setLoading(true);

    try {
      // ✅ درخواست را به سرور Next.js می‌فرستیم (امن)
      const result = await registerCustomerAction({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      if (result.success) {
        toast.success("ثبت‌نام موفقیت‌آمیز بود! 🎉");
        router.push("/account/login");
      } else {
        // نمایش خطای سرور
        let msg = result.error;
        if (typeof msg === 'string' && msg.includes("exists")) {
             msg = "این ایمیل قبلاً ثبت شده است.";
        }
        toast.error(msg);
      }

    } catch (error) {
      toast.error("خطای غیرمنتظره در سیستم.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ایجاد حساب کاربری</h1>
          <p className="mt-2 text-sm text-gray-600">
            برای پیگیری سفارشات خود ثبت‌نام کنید
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نام</Label>
              <Input 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>نام خانوادگی</Label>
              <Input 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>رمز عبور</Label>
            <Input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button 
            type="button" 
            onClick={handleRegisterClick} 
            className="w-full bg-black text-white hover:bg-gray-800" 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "ثبت‌نام"}
          </Button>
        </div>

        <div className="text-center text-sm">
          حساب کاربری دارید؟{" "}
          <Link href="/account/login" className="font-semibold text-blue-600 hover:underline">
            وارد شوید
          </Link>
        </div>
      </div>
    </div>
  );
}