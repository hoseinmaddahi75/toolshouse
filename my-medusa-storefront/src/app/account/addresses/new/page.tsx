"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2, Save, MapPin } from "lucide-react";
import Link from "next/link";
// دقت کنید: مسیر اکشن را درست بدهید (اگر actions.ts در پوشه parent است)
import { addAddressAction } from "../actions"; 
import { toast } from "sonner";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto bg-black text-white gap-2 hover:bg-gray-800" disabled={pending}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
      {pending ? "در حال ثبت..." : "ذخیره آدرس"}
    </Button>
  );
}

const initialState = {
  success: false,
  message: "",
};

export default function NewAddressPage() {
  const [state, formAction] = useActionState(addAddressAction, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.success === false) {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Link href="/account/addresses">
            <Button variant="ghost" size="icon"><ChevronRight className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">افزودن آدرس جدید</h1>
      </div>

      <Card>
        <CardHeader className="bg-gray-50/50 border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-gray-500"/>
                مشخصات گیرنده و نشانی
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form action={formAction} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام <span className="text-red-500">*</span></label>
                <input required name="first_name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام خانوادگی <span className="text-red-500">*</span></label>
                <input required name="last_name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">شماره موبایل <span className="text-red-500">*</span></label>
                <input required name="phone" type="tel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dir-ltr text-right" placeholder="0912..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام شرکت (اختیاری)</label>
                <input name="company" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">استان <span className="text-red-500">*</span></label>
                <input required name="province" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">شهر <span className="text-red-500">*</span></label>
                <input required name="city" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">آدرس پستی دقیق <span className="text-red-500">*</span></label>
              <textarea required name="address_1" rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">کد پستی (۱۰ رقمی) <span className="text-red-500">*</span></label>
                <input required name="postal_code" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dir-ltr text-right" />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
                <SubmitButton />
                <Link href="/account/addresses">
                    <Button type="button" variant="outline" className="w-full md:w-auto">انصراف</Button>
                </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}