// src/components/admin/reports/ProvinceDistribution.tsx
"use client";

import { MapPin } from "lucide-react";

type ProvinceStat = {
  province: string;
  ordersCount: number;
  totalSpent: number;
};

type ProvinceDistributionProps = {
  provinces: ProvinceStat[];
  totalOrders: number;
};

export default function ProvinceDistribution({ provinces, totalOrders }: ProvinceDistributionProps) {
  const maxOrders = provinces.length > 0 ? provinces[0].ordersCount : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            توزیع جغرافیایی سفارش‌ها (استان‌ها)
          </h2>
          <p className="text-xs text-gray-500 mt-1">تمرکز فروشگاه در استان‌های مختلف کشور</p>
        </div>
      </div>

      {provinces.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">اطلاعات استانی یافت نشد.</p>
      ) : (
        <div className="space-y-4">
          {provinces.map((item, idx) => {
            const percentage = totalOrders > 0 ? Math.round((item.ordersCount / totalOrders) * 100) : 0;
            const barWidth = Math.round((item.ordersCount / maxOrders) * 100);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-800">{item.province}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{new Intl.NumberFormat("fa-IR").format(item.ordersCount)} سفارش ({percentage}٪)</span>
                    <span className="font-bold text-gray-900">{new Intl.NumberFormat("fa-IR").format(item.totalSpent)} تومان</span>
                  </div>
                </div>

                {/* نوار پیشرفت میزان فروش استان */}
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}