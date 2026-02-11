"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCustomerDetailsAction } from "../actions"; // ✅ الان این ایمپورت درست کار می‌کند
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/medusa-client";
import { User, Mail, Phone, MapPin, Package, ArrowRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDetailsPage() {
  // گرفتن ID از URL
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      const data = await getCustomerDetailsAction(id);
      setCustomer(data);
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  if (loading) {
      return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;
  }

  if (!customer) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-500 font-medium">مشتری یافت نشد یا دسترسی ندارید.</p>
            <Button variant="outline" onClick={() => router.back()}>بازگشت به لیست</Button>
        </div>
      );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* دکمه بازگشت */}
      <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 cursor-pointer w-fit" onClick={() => router.back()}>
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm">بازگشت به لیست مشتریان</span>
      </div>

      {/* هدر اطلاعات کلی */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                <User className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {customer.first_name ? `${customer.first_name} ${customer.last_name}` : "کاربر مهمان"}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {customer.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {customer.phone || "بدون شماره"}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> عضویت: {new Date(customer.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
             <div className="bg-gray-100 px-3 py-1 rounded text-xs text-gray-600">
                شناسه: <span className="font-mono">{customer.id.slice(0, 8)}...</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ستون راست: تاریخچه سفارشات */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="w-4 h-4 text-orange-500" />
                        تاریخچه سفارشات ({customer.orders?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customer.orders && customer.orders.length > 0 ? (
                        <div className="space-y-3">
                            {customer.orders.map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors bg-white">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">سفارش #{order.display_id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                                order.payment_status === 'captured' 
                                                ? 'bg-green-50 text-green-700 border-green-200' 
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {order.payment_status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fa-IR', {year:'numeric', month:'long', day:'numeric'})}</p>
                                    </div>
                                    <div className="text-left flex items-center gap-4">
                                        <p className="font-bold text-sm text-blue-600">{formatPrice(order.total, "irr")}</p>
                                        <Link href={`/dashboard/orders/${order.id}`}>
                                            <Button variant="outline" size="sm" className="text-xs h-8">مشاهده فاکتور</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">این کاربر هنوز هیچ سفارشی ثبت نکرده است.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* ستون چپ: آدرس‌ها */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="w-4 h-4 text-green-600" />
                        آدرس‌های ثبت شده
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customer.shipping_addresses && customer.shipping_addresses.length > 0 ? (
                        <div className="space-y-4">
                            {customer.shipping_addresses.map((addr: any) => (
                                <div key={addr.id} className="p-4 bg-white rounded-lg text-sm border border-gray-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
                                    <p className="font-bold mb-1 text-gray-900">{addr.first_name} {addr.last_name}</p>
                                    <p className="text-gray-600 leading-relaxed text-xs mt-2">
                                        {addr.province ? `${addr.province}، ` : ''}{addr.city}، {addr.address_1}
                                        {addr.address_2 && ` - ${addr.address_2}`}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1">
                                        <p className="text-xs text-gray-500 flex justify-between">
                                            <span>کد پستی:</span>
                                            <span className="font-mono">{addr.postal_code}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 flex justify-between">
                                            <span>تلفن:</span>
                                            <span className="font-mono">{addr.phone}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                             <p className="text-sm text-gray-400">هیچ آدرسی ثبت نشده است.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}