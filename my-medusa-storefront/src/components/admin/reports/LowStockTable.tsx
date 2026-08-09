// src/components/admin/reports/LowStockTable.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, PackageOpen, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";

type LowStockItem = {
  id: string;
  productId: string;
  productTitle: string;
  variantTitle: string;
  thumbnail?: string;
  quantity: number;
};

const ITEMS_PER_PAGE = 5;

export default function LowStockTable({ items }: { items: LowStockItem[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            هشدار موجودی انبار ({new Intl.NumberFormat("fa-IR").format(items.length)} مورد)
          </h2>
          <p className="text-xs text-gray-500 mt-1">محصولاتی که موجودی آن‌ها ۵ عدد یا کمتر است</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b text-xs">
            <tr>
              <th className="py-3 px-4">وضعیت</th>
              <th className="py-3 px-4">محصول</th>
              <th className="py-3 px-4">نوع / متغیر</th>
              <th className="py-3 px-4 text-center">موجودی فعلی</th>
              <th className="py-3 px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-emerald-500">
                    <PackageOpen className="w-8 h-8 mb-2 opacity-50" />
                    <p className="font-medium text-gray-500">انبار در وضعیت عالی است!</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-3.5 px-4">
                    {item.quantity === 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        ناموجود
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        رو به اتمام
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link 
                      href={`/dashboard/products/${item.productId}/edit`}
                      className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.productTitle} fill className="object-cover" />
                        ) : (
                          <PackageOpen className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-gray-800 group-hover:text-blue-600 line-clamp-1">
                        {item.productTitle}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-md">
                      {item.variantTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-bold text-lg ${item.quantity === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {new Intl.NumberFormat("fa-IR").format(item.quantity)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/dashboard/products/${item.productId}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <span>مدیریت</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 💡 کنترل‌های صفحه‌بندی (Pagination) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t text-xs text-gray-500">
          <span>
            نمایش {new Intl.NumberFormat("fa-IR").format(startIndex + 1)} تا{" "}
            {new Intl.NumberFormat("fa-IR").format(Math.min(startIndex + ITEMS_PER_PAGE, items.length))} از{" "}
            {new Intl.NumberFormat("fa-IR").format(items.length)} مورد
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="font-bold text-gray-700">
              صفحه {new Intl.NumberFormat("fa-IR").format(currentPage)} از {new Intl.NumberFormat("fa-IR").format(totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}