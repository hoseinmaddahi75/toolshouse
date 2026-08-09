// src/app/(admin)/dashboard/reports/orders/page.tsx
import DateFilter from "@/components/admin/reports/DateFilter";
import ReportsTabs from "@/components/admin/reports/ReportsTabs";
import OrderStatusChart from "@/components/admin/reports/OrderStatusChart";
import { getOrdersReport } from "../actions";
import { 
  ShoppingBag, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

export const dynamic = "force-dynamic";

function getPreviousPeriod(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  
  const prevTo = new Date(fromDate.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diffTime);
  
  return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() };
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function OrdersReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const from = params.from || sevenDaysAgo.toISOString();
  const to = params.to || now.toISOString();

  const { prevFrom, prevTo } = getPreviousPeriod(from, to);

  // دریافت دیتای بازه فعلی و قبلی
  const currentData = await getOrdersReport(from, to);
  const prevData = await getOrdersReport(prevFrom, prevTo);

  const orders = currentData.orders;
  const prevOrders = prevData.orders;

  // ۱. محاسبه میانگین تعداد قلم در هر سفارش (Avg Items per Order)
  const totalItemsCount = orders.reduce((sum: number, o: any) => {
    const itemsInOrder = o.items ? o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0) : 0;
    return sum + itemsInOrder;
  }, 0);
  const avgItemsPerOrder = currentData.count > 0 ? (totalItemsCount / currentData.count).toFixed(1) : "0";

  // ۲. محاسبه نرخ لغو/مرجوعی (Cancellation Rate)
  const canceledOrdersCount = orders.filter((o: any) => o.payment_status === "canceled" || o.status === "canceled").length;
  const cancelRate = currentData.count > 0 ? Math.round((canceledOrdersCount / currentData.count) * 100) : 0;

  // ۳. تعداد سفارشات تکمیل/تحویل‌شده
  const completedOrdersCount = orders.filter((o: any) => 
    ["captured", "authorized"].includes(o.payment_status) && o.payment_status !== "canceled"
  ).length;

  const growthOrders = calculateGrowth(currentData.count, prevData.count);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">گزارش سفارش‌ها</h1>
        <p className="text-sm text-gray-500">تحلیل وضعیت پردازش، ارسال و سلامت سفارشات</p>
      </div>

      {/* تب‌های نویگیشن */}
      <ReportsTabs />

      {/* فیلتر تاریخ */}
      <DateFilter />

      {/* کارت‌های شاخص کلیدی (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* کل سفارشات */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">کل سفارشات بازه</h3>
            <div className="p-2 rounded-lg bg-blue-50">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(currentData.count)}</span>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              growthOrders > 0 ? 'text-green-700 bg-green-50' : growthOrders < 0 ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'
            }`}>
              {growthOrders > 0 ? <TrendingUp className="w-3 h-3" /> : growthOrders < 0 ? <TrendingDown className="w-3 h-3" /> : null}
              <span>{Math.abs(growthOrders)}٪</span>
            </div>
          </div>
        </div>

        {/* میانگین قلم در سفارش */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">میانگین قلم در سفارش</h3>
            <div className="p-2 rounded-lg bg-purple-50">
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(Number(avgItemsPerOrder))} عدد</span>
            <span className="text-xs text-gray-400">در هر سبد خرید</span>
          </div>
        </div>

        {/* سفارشات موفق */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">سفارشات موفق / تاییدشده</h3>
            <div className="p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(completedOrdersCount)}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">
              {currentData.count > 0 ? Math.round((completedOrdersCount / currentData.count) * 100) : 0}٪ کل
            </span>
          </div>
        </div>

        {/* نرخ لغو سفارش (با هشدار بصری) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">نرخ لغو سفارشات</h3>
            <div className={`p-2 rounded-lg ${cancelRate > 10 ? 'bg-rose-100' : 'bg-rose-50'}`}>
              <AlertTriangle className={`w-5 h-5 ${cancelRate > 10 ? 'text-rose-700' : 'text-rose-600'}`} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{cancelRate}٪</span>
            {cancelRate > 10 ? (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                ⚠️ بالا
              </span>
            ) : (
              <span className="text-xs text-gray-400">طبیعی</span>
            )}
          </div>
        </div>

      </div>

      {/* نمودار دونات تفکیک وضعیت‌ها */}
      <OrderStatusChart orders={orders} />

    </div>
  );
}