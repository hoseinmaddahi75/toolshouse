// src/components/admin/reports/TopCustomersTable.tsx
"use client";

import { Crown, UserCheck } from "lucide-react";
import Link from "next/link";

type CustomerStat = {
  id?: string;
  email: string;
  name: string;
  ordersCount: number;
  totalSpent: number;
};

type TopCustomersTableProps = {
  customers: CustomerStat[];
};

export default function TopCustomersTable({ customers }: TopCustomersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            برترین مشتریان (مشتریان VIP)
          </h2>
          <p className="text-xs text-gray-500 mt-1">خریداران با بالاترین حجم خرید در این بازه زمانی</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b text-xs">
            <tr>
              <th className="py-3 px-4">رتبه</th>
              <th className="py-3 px-4">نام مشتری / ایمیل</th>
              <th className="py-3 px-4 text-center">تعداد سفارشات</th>
              <th className="py-3 px-4 text-left">مجموع خرید (تومان)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  مشتری یافت نشد.
                </td>
              </tr>
            ) : (
              customers.map((c, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-500 text-xs">
                    {index < 3 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-bold">
                        {index + 1}
                      </span>
                    ) : (
                      `#${index + 1}`
                    )}
                  </td>
                  <td className="py-3.5 px-4">
  <Link href={c.id ? `/dashboard/customers/${c.id}` : "/dashboard/customers"} className="flex flex-col hover:text-blue-600 transition-colors">
    <span className="font-bold text-gray-900 flex items-center gap-1.5">
      {c.name}
      {index < 3 && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md">VIP</span>}
    </span>
    <span className="text-xs text-gray-400">{c.email}</span>
  </Link>
</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                      <UserCheck className="w-3 h-3" />
                      {new Intl.NumberFormat("fa-IR").format(c.ordersCount)} سفارش
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-left font-bold text-gray-900">
                    {new Intl.NumberFormat("fa-IR").format(c.totalSpent)}
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