// src/app/(admin)/dashboard/reports/customers/page.tsx
import DateFilter from "@/components/admin/reports/DateFilter";
import ReportsTabs from "@/components/admin/reports/ReportsTabs";
import ProvinceDistribution from "@/components/admin/reports/ProvinceDistribution";
import TopCustomersTable from "@/components/admin/reports/TopCustomersTable";
import { getOrdersReport, getCustomerAnalytics } from "../actions";
import { Users, Repeat, Crown, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersReportPage({
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
  
  // تحلیل آمار مشتریان و استان‌ها
  const { totalActiveCustomers, repeatRate, topCustomers, provincesList } = 
    await getCustomerAnalytics(currentOrders.orders);

  const topProvince = provincesList.length > 0 ? provincesList[0].province : "ثبت نشده";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">گزارش مشتریان و جغرافیا</h1>
        <p className="text-sm text-gray-500">شناسایی مشتریان وفادار و پراکندگی جغرافیایی خریداران</p>
      </div>

      {/* تب‌های نویگیشن */}
      <ReportsTabs />

      {/* فیلتر تاریخ */}
      <DateFilter />

      {/* کارت‌های KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* خریداران فعال */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">خریداران فعال بازه</h3>
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('fa-IR').format(totalActiveCustomers)} نفر</span>
            <span className="text-xs text-gray-400">حداقل یک ثبت سفارش</span>
          </div>
        </div>

        {/* نرخ خرید مجدد */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">نرخ خرید مجدد</h3>
            <div className="p-2 rounded-lg bg-purple-50">
              <Repeat className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{repeatRate}٪</span>
            <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded-full">
              شاخص وفاداری
            </span>
          </div>
        </div>

        {/* برترین استان */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">استان پیشتاز</h3>
            <div className="p-2 rounded-lg bg-emerald-50">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-bold text-gray-900">{topProvince}</span>
            <span className="text-xs text-gray-400">بیشترین تعداد سفارش</span>
          </div>
        </div>

        {/* برترین خریدار */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">بزرگ‌ترین سفارش‌دهنده</h3>
            <div className="p-2 rounded-lg bg-amber-50">
              <Crown className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-gray-900 line-clamp-1">
              {topCustomers.length > 0 ? topCustomers[0].name : "موردی نیست"}
            </span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-full">VIP</span>
          </div>
        </div>

      </div>

      {/* بخش توزیع استان‌ها و جدول مشتریان VIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProvinceDistribution provinces={provincesList} totalOrders={currentOrders.count} />
        <TopCustomersTable customers={topCustomers} />
      </div>

    </div>
  );
}