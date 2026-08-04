// src/components/admin/orders-table.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ChevronRight, ChevronLeft, HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// 💡 دیکشنری استاندارد وضعیت‌های مدوسا به فارسی
const orderStatusMap: Record<string, string> = {
  pending: "در انتظار بررسی",
  completed: "تکمیل شده",
  archived: "بایگانی شده",
  canceled: "لغو شده",
  requires_action: "نیازمند اقدام",
};

const paymentStatusMap: Record<string, string> = {
  not_paid: "پرداخت نشده",
  awaiting: "در انتظار پرداخت",
  authorized: "تایید شده",
  captured: "پرداخت شده",
  partially_paid: "پرداخت ناقص",
  refunded: "مسترد شده",
  partially_refunded: "استرداد جزئی",
  canceled: "لغو شده",
  requires_action: "نیازمند اقدام",
};

const fulfillmentStatusMap: Record<string, string> = {
  not_fulfilled: "ارسال نشده",
  partially_fulfilled: "در حال آماده‌سازی",
  fulfilled: "آماده ارسال",
  partially_shipped: "ارسال جزئی",
  shipped: "ارسال شده",
  partially_delivered: "تحویل جزئی",
  delivered: "تحویل داده شده",
  canceled: "لغو شده",
  returned: "مرجوع شده",
  requires_action: "نیازمند اقدام",
};

// تابع کمکی برای دادن رنگ به وضعیت‌ها
const getStatusColor = (status: string) => {
  if (['captured', 'completed', 'delivered', 'shipped', 'fulfilled'].includes(status)) return 'bg-green-100 text-green-700 border-green-200';
  if (['authorized', 'partially_fulfilled', 'partially_shipped', 'partially_delivered'].includes(status)) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (['canceled', 'refunded', 'returned'].includes(status)) return 'bg-red-100 text-red-700 border-red-200';
  if (['pending', 'awaiting', 'not_fulfilled', 'not_paid'].includes(status)) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

type OrdersTableProps = {
  orders: any[];
  count: number;
  currentPage: number;
  limit: number;
};

export default function OrdersTable({ orders, count, currentPage, limit }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 💡 استیت برای مدیریت باز و بسته بودن پاپ‌آپ راهنما
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const totalPages = Math.ceil(count / limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const getCustomerName = (order: any) => {
    if (order.customer?.first_name || order.customer?.last_name) {
      return `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
    }
    if (order.shipping_address?.first_name || order.shipping_address?.last_name) {
      return `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim();
    }
    return "مهمان";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">مدیریت سفارشات</h1>
        
        {/* 💡 بخش دکمه راهنما و تعداد کل در هدر */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            راهنمای وضعیت‌ها
          </button>
          
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-100 shadow-sm">
            تعداد کل: {count}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden shadow-sm border-gray-200">
        <CardHeader className="bg-white border-b pb-4">
          <CardTitle className="text-lg">لیست سفارشات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-right">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="h-11 px-4 font-semibold text-gray-600">شماره</th>
                  <th className="h-11 px-4 font-semibold text-gray-600">تاریخ</th>
                  <th className="h-11 px-4 font-semibold text-gray-600">مشتری</th>
                  <th className="h-11 px-4 font-semibold text-gray-600">مبلغ</th>
                  <th className="h-11 px-4 font-semibold text-gray-600">وضعیت</th>
                  <th className="h-11 px-4 font-semibold text-gray-600">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      هیچ سفارشی یافت نشد.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-mono font-medium text-gray-900">#{order.display_id}</td>
                      <td className="p-4 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString('fa-IR', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-900">
                                {getCustomerName(order)}
                            </span>
                            <span className="text-xs text-gray-500">{order.email}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                         {new Intl.NumberFormat('fa-IR').format(order.total / 10)} <span className="text-xs font-normal text-gray-400">تومان</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(order.payment_status)}`}>
                            پ: {paymentStatusMap[order.payment_status] || order.payment_status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(order.fulfillment_status)}`}>
                            ا: {fulfillmentStatusMap[order.fulfillment_status] || order.fulfillment_status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors text-xs font-medium border border-transparent hover:border-blue-100">
                            <Eye className="w-3.5 h-3.5" /> جزئیات
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    نمایش <span className="font-medium font-mono text-gray-900">{(currentPage - 1) * limit + 1}</span> تا{" "}
                    <span className="font-medium font-mono text-gray-900">{Math.min(currentPage * limit, count)}</span> از{" "}
                    <span className="font-medium font-mono text-gray-900">{count}</span> سفارش
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination" dir="ltr">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                          pageNumber === currentPage
                            ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 💡 پاپ‌آپ راهنمای وضعیت‌ها (Modal) */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                راهنمای رنگ‌ها و وضعیت‌ها
              </h2>
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 space-y-8">
              
              {/* وضعیت‌های پرداخت */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-4 border-b pb-2">وضعیت‌های پرداخت (ستون پ)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('captured')}`}>پرداخت شده</span>
                    <p className="text-xs text-gray-600">پول با موفقیت وارد حساب درگاه شده و پرداخت نهایی است.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('authorized')}`}>تایید شده</span>
                    <p className="text-xs text-gray-600">پول در حساب مشتری مسدود شده ولی هنوز توسط ادمین تسخیر (Capture) نشده.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('awaiting')}`}>در انتظار پرداخت</span>
                    <p className="text-xs text-gray-600">سفارش ثبت شده اما مشتری هنوز پولی پرداخت نکرده است.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('refunded')}`}>مسترد شده</span>
                    <p className="text-xs text-gray-600">پول به صورت کامل به حساب مشتری برگشت داده شده است.</p>
                  </div>
                </div>
              </section>

              {/* وضعیت‌های ارسال */}
              <section>
                <h3 className="text-base font-semibold text-gray-800 mb-4 border-b pb-2">وضعیت‌های ارسال (ستون ا)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('fulfilled')}`}>آماده ارسال</span>
                    <p className="text-xs text-gray-600">بسته بندی انجام شده (Fulfillment ایجاد شده) اما کد رهگیری ثبت نشده.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('shipped')}`}>ارسال شده</span>
                    <p className="text-xs text-gray-600">بسته تحویل پست/پیک شده و کد رهگیری روی آن ثبت شده است.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('not_fulfilled')}`}>ارسال نشده</span>
                    <p className="text-xs text-gray-600">هیچ اقدامی برای بسته‌بندی و ارسال این سفارش انجام نشده است.</p>
                  </div>
                  <div className="flex flex-col gap-1 border rounded-lg p-3 bg-gray-50">
                    <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor('canceled')}`}>لغو شده</span>
                    <p className="text-xs text-gray-600">عملیات ارسال توسط ادمین لغو شده است.</p>
                  </div>
                </div>
              </section>

            </div>
            
            <div className="border-t px-6 py-4 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                متوجه شدم
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}