"use client";

import { useActionState, useEffect } from "react";
import { loginAdminAction } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const initialState = { success: false, error: "" };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("ورود موفقیت‌آمیز بود!");
      // هدایت به داشبورد که داخل گروه (admin) است
      router.push("/dashboard"); 
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">ورود مدیران</CardTitle>
          <p className="text-sm text-gray-500 mt-2">پنل مدیریت فروشگاه</p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                className="text-left ltr"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="text-left ltr"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                "ورود به پنل"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}