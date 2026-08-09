// src/app/account/addresses/edit/[id]/edit-form.tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Loader2, Save, MapPin } from "lucide-react";
import Link from "next/link";
import { editAddressAction } from "../../actions"; 
import { toast } from "sonner";
import { useEffect } from "react";
import TapinProvinceCitySelector from "@/components/checkout/TapinProvinceCitySelector";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto bg-black text-white gap-2 hover:bg-gray-800" disabled={pending}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
      {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
    </Button>
  );
}

const initialState = {
  success: false,
  message: "",
};

export default function EditAddressForm({ address }: { address: any }) {
  // 💡 استفاده از علامت سوال (?. ) برای جلوگیری از خطای TypeError
  const addressId = address?.id || "";
  const updateWithId = editAddressAction.bind(null, addressId);
  
  const [state, formAction] = useActionState(updateWithId, initialState);

  useEffect(() => {
    if (state?.message) {
      if (state.success === false) {
        toast.error(state.message);
      }
    }
  }, [state]);

  // اگر دیتا لود نشده بود، صفحه رو خالی نشون میده تا کرش نکنه
  if (!address) return null; 

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Link href="/account/addresses">
            <Button variant="ghost" size="icon"><ChevronRight className="w-5 h-5"/></Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">ویرایش آدرس</h1>
      </div>

      <Card>
        <CardHeader className="bg-gray-50/50 border-b py-4">
            <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-gray-500"/>
                مشخصات فعلی
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form action={formAction} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام</label>
                <input required name="first_name" defaultValue={address?.first_name || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام خانوادگی</label>
                <input required name="last_name" defaultValue={address?.last_name || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">شماره موبایل</label>
                <input required name="phone" defaultValue={address?.phone || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dir-ltr text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام شرکت (اختیاری)</label>
                <input name="company" defaultValue={address?.company || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" />
              </div>
            </div>

            {/* 💡 سلکتور تاپین */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TapinProvinceCitySelector 
                 defaultProvince={address?.province || ""}
                 defaultCity={address?.city || ""}
                 provinceFieldName="province"
                 cityFieldName="city"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">آدرس پستی دقیق</label>
              <textarea required name="address_1" defaultValue={address?.address_1 || ""} rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">کد پستی</label>
                <input required name="postal_code" defaultValue={address?.postal_code || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dir-ltr text-right" />
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