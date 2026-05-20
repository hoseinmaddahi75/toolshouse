import { cookies } from "next/headers"; // ✅ اضافه شد
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldAlert } from "lucide-react";
import ProfileForm from "./profile-form";
import LogoutButton from "@/components/store/logout-button";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

  // 1. خواندن شناسه مشتری از کوکی
  const cookieStore = await cookies();
  const customerId = cookieStore.get("_medusa_jwt")?.value;

  let customer = null;
  let errorMsg = "";

  if (customerId) {
    try {
      // 2. درخواست به API جدیدی که ساختیم
      const res = await fetch(`${BASE_URL}/store/custom-auth/me`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId, // 👈 ارسال شناسه در هدر
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        customer = data.customer;
      } else {
        errorMsg = "مشکل در دریافت اطلاعات از سرور";
      }
    } catch (e) {
      console.error("Profile Fetch Error:", e);
      errorMsg = "خطای ارتباط با سرور";
    }
  } else {
      errorMsg = "شما وارد نشده‌اید";
  }

  if (!customer) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
            {errorMsg || "خطا در بارگذاری اطلاعات کاربری"}
        </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">اطلاعات شخصی</h1>
        <p className="text-gray-500 text-sm mt-1">
          خوش آمدید، {customer.first_name} {customer.last_name}!
        </p>
      </div>

      {/* کارت ۱: ویرایش مشخصات */}
      <Card>
        <CardHeader className="bg-gray-50/50 border-b pb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white border rounded-lg">
                    <UserCog className="w-5 h-5 text-gray-600"/>
                </div>
                <div>
                    <CardTitle className="text-base">ویرایش مشخصات</CardTitle>
                    <CardDescription>نام، ایمیل و شماره موبایل</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6">
            <ProfileForm customer={customer} />
        </CardContent>
      </Card>

      {/* کارت ۲: تغییر رمز (اطلاع‌رسانی) */}
      <Card className="border-orange-100 shadow-sm">
        <CardHeader className="bg-orange-50/30 border-b border-orange-100 pb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white border border-orange-100 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-orange-600"/>
                </div>
                <div>
                    <CardTitle className="text-base text-gray-900">امنیت حساب</CardTitle>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-gray-600">
                    از آنجا که ورود شما با شماره موبایل است، نیازی به رمز عبور ندارید.
                    اما همیشه می‌توانید از دکمه زیر برای خروج استفاده کنید.
                </div>
                <div className="shrink-0">
                    <LogoutButton /> 
                </div>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}