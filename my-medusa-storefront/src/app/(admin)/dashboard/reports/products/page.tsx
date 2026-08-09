// src/app/(admin)/dashboard/reports/products/page.tsx
import ReportsTabs from "@/components/admin/reports/ReportsTabs";
import LowStockTable from "@/components/admin/reports/LowStockTable";
import { getInventoryAlerts } from "../actions";
import { PackageX, ArchiveRestore, Star, MessageSquareWarning } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsReportPage() {
  // دریافت لیست محصولات رو به اتمام
  const lowStockItems = await getInventoryAlerts();

  const outOfStockCount = lowStockItems.filter(i => i.quantity === 0).length;
  const runningLowCount = lowStockItems.filter(i => i.quantity > 0 && i.quantity <= 5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">گزارش محصولات و انبار</h1>
        <p className="text-sm text-gray-500">مدیریت موجودی کالاها و تحلیل رضایت مشتریان</p>
      </div>

      <ReportsTabs />

      {/* کارت‌های KPI انبار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* کالاهای ناموجود */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">کالاهای ناموجود</h3>
            <div className={`p-2 rounded-lg ${outOfStockCount > 0 ? 'bg-rose-50' : 'bg-gray-50'}`}>
              <PackageX className={`w-5 h-5 ${outOfStockCount > 0 ? 'text-rose-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{outOfStockCount} <span className="text-sm font-normal text-gray-500">متغیر</span></span>
            {outOfStockCount > 0 && <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-full animate-pulse">نیاز به شارژ فوری</span>}
          </div>
        </div>

        {/* کالاهای رو به اتمام */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">رو به اتمام (زیر ۵ عدد)</h3>
            <div className={`p-2 rounded-lg ${runningLowCount > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <ArchiveRestore className={`w-5 h-5 ${runningLowCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{runningLowCount} <span className="text-sm font-normal text-gray-500">متغیر</span></span>
          </div>
        </div>

        {/* میانگین رضایت (Placeholder برای آینده) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px] opacity-70">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">میانگین امتیاز فروشگاه</h3>
            <div className="p-2 rounded-lg bg-yellow-50">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">۴.۸ <span className="text-sm font-normal text-gray-400">/ ۵</span></span>
            <span className="text-xs text-gray-400">بر اساس نظرات</span>
          </div>
        </div>

        {/* شکایات (Placeholder برای آینده) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px] opacity-70">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-gray-500">نظرات نیازمند بررسی</h3>
            <div className="p-2 rounded-lg bg-blue-50">
              <MessageSquareWarning className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">۰</span>
            <span className="text-xs text-gray-400">امتیازهای ۱ و ۲ ستاره</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6">
        <LowStockTable items={lowStockItems} />
      </div>
      
    </div>
  );
}