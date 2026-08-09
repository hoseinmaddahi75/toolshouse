// src/app/(admin)/dashboard/reports/page.tsx
import DateFilter from "@/components/admin/reports/DateFilter";
import SalesChart from "@/components/admin/reports/SalesChart";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, ReceiptText } from "lucide-react";
import ProductSalesTables from "@/components/admin/reports/ProductSalesTables";
import { getOrdersReport, getNewCustomersCount, getProductSalesData } from "./actions";
import ReportsTabs from "@/components/admin/reports/ReportsTabs";


export const dynamic = "force-dynamic";

// تابع محاسبه تاریخ دوره قبلی (برای مقایسه)
function getPreviousPeriod(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  
  const prevTo = new Date(fromDate.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - diffTime);
  
  return { prevFrom: prevFrom.toISOString(), prevTo: prevTo.toISOString() };
}

// تابع محاسبه درصد رشد
function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function ReportsOverviewPage({
  searchParams,
}: {
  // 💡 تغییر مهم: تعریف searchParams به عنوان Promise
  searchParams: Promise<{ from?: string; to?: string }>; 
}) {
  // 💡 باز کردن Promise پارامترها با await (استاندارد جدید Next.js)
  const params = await searchParams;

  // ۱. تنظیم تاریخ پیش‌فرض (۷ روز گذشته تا امروز) اگر URL خالی بود
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const from = params.from || sevenDaysAgo.toISOString();
  const to = params.to || now.toISOString();

  // ۲. محاسبه بازه قبلی برای مقایسه
  const { prevFrom, prevTo } = getPreviousPeriod(from, to);

  // ۳. دریافت دیتای دوره فعلی
  const currentOrders = await getOrdersReport(from, to);
  const currentCustomers = await getNewCustomersCount(from, to);
  const currentAOV = currentOrders.count > 0 ? currentOrders.revenue / currentOrders.count : 0;

  // ۴. دریافت دیتای دوره قبلی
  const prevOrders = await getOrdersReport(prevFrom, prevTo);
  const prevCustomers = await getNewCustomersCount(prevFrom, prevTo);
  const prevAOV = prevOrders.count > 0 ? prevOrders.revenue / prevOrders.count : 0;

  // ۵. کارت‌های KPI
  const kpis = [
    {
      title: "درآمد کل بازه",
      value: `${new Intl.NumberFormat('fa-IR').format(currentOrders.revenue / 10)} تومان`,
      growth: calculateGrowth(currentOrders.revenue, prevOrders.revenue),
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "تعداد سفارش‌ها",
      value: new Intl.NumberFormat('fa-IR').format(currentOrders.count),
      growth: calculateGrowth(currentOrders.count, prevOrders.count),
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "مشتریان جدید",
      value: new Intl.NumberFormat('fa-IR').format(currentCustomers),
      growth: calculateGrowth(currentCustomers, prevCustomers),
      icon: <Users className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "میانگین ارزش سفارش (AOV)",
      value: `${new Intl.NumberFormat('fa-IR').format(currentAOV / 10)} تومان`,
      growth: calculateGrowth(currentAOV, prevAOV),
      icon: <ReceiptText className="w-5 h-5 text-orange-600" />,
      bg: "bg-orange-50",
    },
  ];

// دریافت لیست محصولات پرفروش و کم‌فروش
  const { topProducts, bottomProducts } = await getProductSalesData(currentOrders.orders);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">نمای کلی گزارش‌ها</h1>
        <p className="text-sm text-gray-500">آنالیز دقیق فروش، سفارشات و رفتار مشتریان</p>
      </div>


      <ReportsTabs />
      {/* کامپوننت فیلتر تاریخ (کلاینت ساید) */}
      <DateFilter />

      {/* کارت‌های KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{kpi.title}</h3>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
            </div>
            
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-gray-900" dir="ltr">{kpi.value}</span>
              
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                kpi.growth > 0 ? 'text-green-700 bg-green-50' : 
                kpi.growth < 0 ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'
              }`}>
                {kpi.growth > 0 ? <TrendingUp className="w-3 h-3" /> : 
                 kpi.growth < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                <span dir="ltr">{Math.abs(kpi.growth)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 💡 کامپوننت نمودار فروش */}
      <SalesChart orders={currentOrders.orders} />

      {/* 💡 جداول محصولات پرفروش و کم‌فروش */}
      <ProductSalesTables topProducts={topProducts} bottomProducts={bottomProducts} />

    </div>
  );
}