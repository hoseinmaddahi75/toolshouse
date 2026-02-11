"use client";

import { useEffect, useState } from "react";
import { getCustomersAction } from "./actions"; // 👈 ایمپورت اکشن جدید
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const res = await getCustomersAction();
      if (res.success) {
        setCustomers(res.customers);
      } else {
        toast.error(res.error || "خطا در دریافت لیست مشتریان");
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
      return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">مدیریت مشتریان</h1>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
            تعداد کل: {customers.length} نفر
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران سایت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-right">
              <thead className="[&_tr]:border-b bg-gray-50">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">نام و نام خانوادگی</th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">اطلاعات تماس</th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">تاریخ عضویت</th>
                  <th className="h-12 px-4 align-middle font-medium text-gray-500">عملیات</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {customers.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                            هیچ مشتری‌ای یافت نشد.
                        </td>
                    </tr>
                ) : (
                    customers.map((customer: any) => (
                    <tr key={customer.id} className="border-b transition-colors hover:bg-gray-50">
                        <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-900">
                                    {customer.first_name ? `${customer.first_name} ${customer.last_name}` : "کاربر مهمان"}
                                </span>
                            </div>
                        </td>
                        <td className="p-4 align-middle">
                            <div className="flex flex-col gap-1 text-gray-600">
                                <div className="flex items-center gap-2 text-xs">
                                    <Mail className="w-3 h-3" /> {customer.email}
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <Phone className="w-3 h-3" /> {customer.phone}
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="p-4 align-middle text-gray-500">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {new Date(customer.created_at).toLocaleDateString('fa-IR')}
                            </div>
                        </td>
                        <td className="p-4 align-middle">
                            <Link href={`/dashboard/customers/${customer.id}`}>
                                <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md transition-colors text-xs font-medium border border-blue-200">
                                    <Eye className="w-3 h-3" />
                                    مشاهده جزئیات
                                </button>
                            </Link>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}