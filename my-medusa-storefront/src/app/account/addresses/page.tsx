import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Phone, Edit, Building2 } from "lucide-react";
import Link from "next/link";
import DeleteAddressButton from "./delete-button";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";
import { getCustomerIdFromCookie } from "@/lib/auth";

// اجبار به رفرش شدن دیتا در هر بار لود
export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const BASE_URL = MEDUSA_BACKEND_URL;
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
  
  // ۱. دریافت توکن مشتری
  const customerId = await getCustomerIdFromCookie();

  let addresses = [];

  // ۲. درخواست به API اختصاصی (با سیستم ضد کش)
  if (customerId) {
    try {
      const res = await fetch(`${BASE_URL}/store/custom-addresses?t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_KEY,
          "x-customer-id": customerId,
        },
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        addresses = data.addresses || [];
      }
    } catch (e) {
      console.error("Addresses Fetch Error:", e);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* هدر صفحه */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-gray-400"/>
                دفترچه آدرس‌ها
            </h1>
            <p className="text-gray-500 text-sm mt-1">مدیریت آدرس‌های ارسال سفارش</p>
        </div>
        <Link href="/account/addresses/new" className="w-full sm:w-auto">
            <Button className="gap-2 bg-black hover:bg-gray-800 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4" /> ثبت آدرس جدید
            </Button>
        </Link>
      </div>

      {/* لیست آدرس‌ها */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">آدرسی ثبت نشده است</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">برای ارسال سریع‌تر سفارشات، لطفاً یک آدرس ثبت کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr: any) => (
            <Card key={addr.id} className="group hover:border-black transition-colors relative overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-3 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500"/>
                            <CardTitle className="text-base font-bold text-gray-900">
                                {addr.first_name} {addr.last_name}
                            </CardTitle>
                        </div>
                        {addr.company && (
                             <span className="flex items-center gap-1 text-[10px] bg-white border px-2 py-0.5 rounded text-gray-600">
                                 <Building2 className="w-3 h-3"/> {addr.company}
                             </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {/* متن آدرس */}
                    <div className="min-h-[40px]">
                         <p className="text-sm text-gray-800 leading-relaxed font-medium">
                            {addr.province}، {addr.city}
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1">
                            {addr.address_1}
                        </p>
                    </div>
                    
                    {/* اطلاعات تماس */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-dashed">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                            <span className="bg-gray-50 px-2 py-1.5 rounded border flex items-center gap-1">
                                <span>کدپستی:</span>
                                <span className="font-mono text-gray-700 tracking-wider">{addr.postal_code}</span>
                            </span>
                            <span className="bg-gray-50 px-2 py-1.5 rounded border flex items-center gap-1">
                                <Phone className="w-3 h-3"/> 
                                <span className="dir-ltr text-gray-700">{addr.phone}</span>
                            </span>
                        </div>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Link href={`/account/addresses/edit/${addr.id}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full gap-2 text-gray-700 hover:text-black hover:bg-gray-50 h-9 text-xs">
                                <Edit className="w-3.5 h-3.5" /> ویرایش
                            </Button>
                        </Link>
                        <DeleteAddressButton id={addr.id} />
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}