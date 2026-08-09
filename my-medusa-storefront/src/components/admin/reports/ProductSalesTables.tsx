// src/components/admin/reports/ProductSalesTables.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

type ProductStat = {
  id: string;
  title: string;
  thumbnail?: string;
  totalQuantity: number;
  totalRevenue: number;
};

type ProductSalesTablesProps = {
  topProducts: ProductStat[];
  bottomProducts: ProductStat[];
};

export default function ProductSalesTables({ topProducts, bottomProducts }: ProductSalesTablesProps) {
  const [activeTab, setActiveTab] = useState<"top" | "bottom">("top");

  const currentList = activeTab === "top" ? topProducts : bottomProducts;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-800">گزارش فروش محصولات</h2>
          <p className="text-xs text-gray-500 mt-1">رتبه‌بندی محصولات بر اساس تعداد و مبلغ فروش در بازه انتخابی</p>
        </div>

        {/* دکمه‌های سوئیچ بین پرفروش و کم‌فروش */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("top")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "top"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            ۱۰ پرفروش‌ترین
          </button>

          <button
            onClick={() => setActiveTab("bottom")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "bottom"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            ۱۰ کم‌فروش‌ترین
          </button>
        </div>
      </div>

      {/* جدول نمایش لیست */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b text-xs">
            <tr>
              <th className="py-3 px-4">رتبه</th>
              <th className="py-3 px-4">محصول</th>
              <th className="py-3 px-4 text-center">تعداد فروخته‌شده</th>
              <th className="py-3 px-4 text-left">مجموع درآمد (تومان)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  اطلاعاتی برای این بخش یافت نشد.
                </td>
              </tr>
            ) : (
              currentList.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-500 text-xs">
                    #{index + 1}
                  </td>
                  <td className="py-3.5 px-4">
  <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 hover:text-blue-600 transition-colors">
    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
      {product.thumbnail ? (
        <Image src={product.thumbnail} alt={product.title} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <Package className="w-5 h-5" />
        </div>
      )}
    </div>
    <span className="font-medium text-gray-800 hover:text-blue-600 line-clamp-1">{product.title}</span>
  </Link>
</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {new Intl.NumberFormat("fa-IR").format(product.totalQuantity)} عدد
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-left font-bold text-gray-900">
                    {new Intl.NumberFormat("fa-IR").format(product.totalRevenue)}
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