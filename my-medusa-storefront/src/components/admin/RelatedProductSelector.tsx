"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

// اگر MEDUSA_ADMIN_URL در constants نبود، از MEDUSA_BACKEND_URL استفاده می‌کنیم
const ADMIN_URL = MEDUSA_BACKEND_URL || "http://localhost:9000";

interface RelatedProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  adminToken?: string; // توکن ادمین در صورت نیاز
}

export default function RelatedProductSelector({
  selectedIds = [],
  onChange,
  adminToken,
}: RelatedProductSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  // ۱. جستجوی زنده محصولات
  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (adminToken) {
          headers["Authorization"] = `Bearer ${adminToken}`;
        }

        const res = await fetch(`${ADMIN_URL}/admin/products?q=${encodeURIComponent(query)}&limit=8`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchProducts, 400);
    return () => clearTimeout(timer);
  }, [query, adminToken]);

  // ۲. دریافت اطلاعات محصولات انتخاب‌شده قبلی جهت نمایش عنوان و تصویر آن‌ها
  useEffect(() => {
    const fetchSelectedProducts = async () => {
      if (!selectedIds || selectedIds.length === 0) {
        setSelectedProducts([]);
        return;
      }

      // فقط محصولاتی که هنوز اطلاعاتشان در استیت نیست را دریافت می‌کنیم
      const missingIds = selectedIds.filter(
        (id) => !selectedProducts.some((p: any) => p.id === id)
      );

      if (missingIds.length === 0) return;

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (adminToken) {
          headers["Authorization"] = `Bearer ${adminToken}`;
        }

        const queryParams = missingIds.map((id) => `id[]=${id}`).join("&");
        const res = await fetch(`${ADMIN_URL}/admin/products?${queryParams}`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          setSelectedProducts((prev: any[]) => {
            const combined = [...prev, ...(data.products || [])];
            // حذف تکراری‌ها
            return Array.from(new Map(combined.map((item: any) => [item.id, item])).values());
          });
        }
      } catch (error) {
        console.error("Error fetching selected products:", error);
      }
    };

    fetchSelectedProducts();
  }, [selectedIds, adminToken]);

  // ۳. اضافه یا حذف محصول از لیست انتخاب‌شده‌ها
  const toggleProduct = (product: any) => {
    const isSelected = selectedIds.includes(product.id);
    let updatedIds: string[];

    if (isSelected) {
      updatedIds = selectedIds.filter((id) => id !== product.id);
      setSelectedProducts((prev: any[]) => prev.filter((p: any) => p.id !== product.id));
    } else {
      updatedIds = [...selectedIds, product.id];
      setSelectedProducts((prev: any[]) => [...prev, product]);
    }

    onChange(updatedIds);
  };

  return (
    <div className="space-y-4 border p-4 rounded-xl bg-gray-50/50" dir="rtl">
      <label className="text-sm font-bold text-gray-700 block">
        محصولات مرتبط (انتخاب دستی)
      </label>

      {/* لیست محصولات انتخاب‌شده به صورت نشان‌گر (Badge) */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedProducts.map((p: any) => (
            <Badge
              key={p.id}
              variant="secondary"
              className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-gray-200 shadow-sm text-gray-800"
            >
              {p.thumbnail && (
                <img
                  src={p.thumbnail}
                  alt={p.title}
                  className="w-4 h-4 rounded object-cover"
                />
              )}
              <span className="truncate max-w-[160px] text-xs font-medium">{p.title}</span>
              <button
                type="button"
                onClick={() => toggleProduct(p)}
                className="text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* ورودی جستجو */}
      <div className="relative">
        <Input
          placeholder="نام محصول مورد نظر را تایپ کنید..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-3 py-2 text-sm"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 absolute left-3 top-3 animate-spin text-gray-400" />
        ) : (
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        )}
      </div>

      {/* لیست نتایج جستجو */}
      {results.length > 0 && (
        <div className="bg-white border rounded-lg shadow-md overflow-hidden flex flex-col max-h-60 overflow-y-auto">
          {results.map((product: any) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product)}
                className={`flex items-center justify-between p-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-50/60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-9 h-9 rounded object-cover border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                      بدون عکس
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{product.title}</span>
                    {product.handle && (
                      <span className="text-xs text-gray-400 dir-ltr text-right">
                        /{product.handle}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}