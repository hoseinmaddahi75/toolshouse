// src/components/admin/reports/PromotionsTable.tsx
"use client";

import { TicketPercent } from "lucide-react";
import Link from "next/link";

type PromoStat = {
  code: string;
  count: number;
  totalDiscount: number;
};

type PromotionsTableProps = {
  promotions: PromoStat[];
};

export default function PromotionsTable({ promotions }: PromotionsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-rose-500" />
            عملکرد کدهای تخفیف
          </h2>
          <p className="text-xs text-gray-500 mt-1">لیست کمپین‌ها و کدهای استفاده شده در این بازه</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b text-xs">
            <tr>
              <th className="py-3 px-4">رتبه</th>
              <th className="py-3 px-4">کد تخفیف</th>
              <th className="py-3 px-4 text-center">دفعات استفاده</th>
              <th className="py-3 px-4 text-left">مجموع تخفیف داده‌شده (تومان)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  هیچ کد تخفیفی در این بازه استفاده نشده است.
                </td>
              </tr>
            ) : (
              promotions.map((promo, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-500 text-xs">
                    #{index + 1}
                  </td>
                  <td className="py-3.5 px-4">
  <Link href="/dashboard/promotions" className="inline-block px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
    {promo.code}
  </Link>
</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                      {new Intl.NumberFormat("fa-IR").format(promo.count)} بار
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-left font-bold text-gray-900">
                    {new Intl.NumberFormat("fa-IR").format(promo.totalDiscount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}