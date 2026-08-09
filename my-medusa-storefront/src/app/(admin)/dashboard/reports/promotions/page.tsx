// src/app/(admin)/dashboard/reports/promotions/page.tsx
import DateFilter from "@/components/admin/reports/DateFilter";
import ReportsTabs from "@/components/admin/reports/ReportsTabs";
import PromotionsTable from "@/components/admin/reports/PromotionsTable";
import { getOrdersReport, getPromotionsAnalytics } from "../actions";
import { Gift, Tags, TrendingUp, TrendingDown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PromotionsReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const from = params.from || sevenDaysAgo.toISOString();
  const to = params.to || now.toISOString();

  // دریافت دیتای سفارشات
  const currentOrders = await getOrdersReport(from, to);
  
  // تحلیل آمار تخفیف‌ها
  const { 
    totalDiscountAmount, 
    discountUsageRate, 
    aovWithDiscount, 
    aovWithoutDiscount, 
    topPromotions 
  } = await getPromotionsAnalytics(currentOrders.orders);

  // محاسبه تاثیر تخفیف روی ارزش سبد خرید (آیا تخفیف باعث شده بیشتر خرید کنن؟)
  const aovDifference = aovWithDiscount - aovWithoutDiscount;
  const aovGrowthRate = aovWithoutDiscount > 0 ? Math.round((aovDifference / aovWithoutDiscount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">گزارش کمپین‌ها و تخفیف‌ها</h1>
        <p className="text-sm text-gray-500">تحلیل تاثیر کدهای تخفیف بر رفتار خرید مشتریان</p>
      </div>

      <ReportsTabs />
      <DateFilter />

      {/* کارت‌های KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* مجموع تخفیف داده شده */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">مجموع تخفیف داده‌شده</h3>
            <div className="p-2 rounded-lg bg-rose-50">
              <Gift className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(totalDiscountAmount)} تومان</span>
            <span className="text-xs text-gray-400">در بازه انتخابی</span>
          </div>
        </div>

        {/* ضریب نفوذ تخفیف */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">نرخ استفاده از تخفیف</h3>
            <div className="p-2 rounded-lg bg-blue-50">
              <Tags className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{discountUsageRate}٪</span>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-full">
              از کل سفارشات
            </span>
          </div>
        </div>

        {/* مقایسه سبد خرید (AOV) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">تاثیر تخفیف روی ارزش سبد</h3>
            <div className={`p-2 rounded-lg ${aovGrowthRate > 0 ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              {aovGrowthRate > 0 ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-gray-600" />}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(aovWithDiscount)} تومان</span>
              <span className="text-[10px] text-gray-400">بدون تخفیف: {new Intl.NumberFormat('fa-IR').format(aovWithoutDiscount)}</span>
            </div>
            {aovGrowthRate !== 0 && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${aovGrowthRate > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                {aovGrowthRate > 0 ? "+" : ""}{aovGrowthRate}٪
              </span>
            )}
          </div>
        </div>

      </div>

      <PromotionsTable promotions={topPromotions} />
    </div>
  );
}