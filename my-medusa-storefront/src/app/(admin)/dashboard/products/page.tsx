import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/medusa-client";
import { Button } from "@/components/ui/button";
import { Plus, Box, ChevronRight, ChevronLeft } from "lucide-react";
import ProductActions from "@/components/admin/product-actions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductToolbar from "@/components/admin/products/product-toolbar"; // 👈 ایمپورت کامپوننت جدید
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 🟢 تابع دریافت محصولات با قابلیت فیلتر و جستجو
async function getAdminProducts(page: number, limit: number, query: string, order: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("_medusa_admin_token")?.value;
const backendUrl = MEDUSA_BACKEND_URL;

  if (!token) return { products: [], count: 0 };

  try {
    const offset = (page - 1) * limit;
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      // فیلدهای مورد نیاز برای نمایش و محاسبه موجودی
      fields: "id,title,thumbnail,handle,status,+variants.prices,+variants.options,*variants.inventory_items.inventory.location_levels,+status",
      order: order // اعمال سورت
    });

    // اعمال جستجو
    if (query) {
        params.append("q", query);
    }

    const res = await fetch(`${backendUrl}/admin/products?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 401) return { error: "unauthorized" };
        return { products: [], count: 0 };
    }
    
    const data = await res.json();
    return data;

  } catch (e) {
    console.error("Network Error:", e);
    return { products: [], count: 0 };
  }
}

// توابع کمکی محاسباتی
const findPrice = (variants: any[]) => {
    if (!variants || variants.length === 0) return 0;
    const prices = variants[0].prices || [];
    const irrPrice = prices.find((p: any) => p.currency_code === "irr" || p.currency_code === "irt");
    if (irrPrice) return irrPrice.amount;
    return prices[0]?.amount || 0;
};

const calculateInventory = (variants: any[]) => {
    if (!variants) return 0;
    return variants.reduce((totalAcc: number, variant: any) => {
        if (!variant.inventory_items || variant.inventory_items.length === 0) {
            return totalAcc + (variant.inventory_quantity || 0);
        }
        const variantStock = variant.inventory_items.reduce((invAcc: number, link: any) => {
            const levels = link.inventory?.location_levels || [];
            return invAcc + levels.reduce((lvlAcc: number, l: any) => lvlAcc + (l.stocked_quantity || 0), 0);
        }, 0);
        return totalAcc + variantStock;
    }, 0);
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // خواندن پارامترها از URL
  const page = Number(params.page) || 1;
  const query = (params.q as string) || "";
  const order = (params.order as string) || "-created_at";
  const limit = 50;

  const data = await getAdminProducts(page, limit, query, order);

  if (data.error === "unauthorized") redirect("/admin/login");

  const products = data.products || [];
  const count = data.count || 0;
  const totalPages = Math.ceil(count / limit);

  return (
    <div className="space-y-6">
      
      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت {count} محصول موجود در فروشگاه
          </p>
        </div>
        <Link href="/dashboard/products/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            افزودن محصول جدید
            </Button>
        </Link>
      </div>

      {/* تولبار (کامپوننت کلاینت) */}
      <ProductToolbar />

      {/* جدول محصولات */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
             <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium w-20">تصویر</th>
                <th className="px-6 py-4 font-medium">نام محصول</th>
                <th className="px-6 py-4 font-medium">موجودی</th>
                <th className="px-6 py-4 font-medium">قیمت پایه</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium w-24">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <div className="flex flex-col items-center justify-center w-full">
                        <Box className="w-10 h-10 mb-2 opacity-20"/>
                        <p>هیچ محصولی پیدا نشد.</p>
                        {query && <p className="text-xs mt-1 text-gray-500">نتیجه‌ای برای "{query}" یافت نشد.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product: any) => {
                  const price = findPrice(product.variants);
                  const totalInventory = calculateInventory(product.variants);

                  return (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="relative h-12 w-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          {product.thumbnail ? (
                            <Image src={product.thumbnail} alt={product.title || ""} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                              <Box className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-3 font-medium text-gray-900">
                        {product.title}
                        <div className="text-xs text-gray-400 mt-1 font-mono">{product.handle}</div>
                      </td>

                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${totalInventory > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                          {totalInventory} عدد
                        </span>
                      </td>

                      <td className="px-6 py-3 text-gray-600">
                        {formatPrice(price, "irr")}
                      </td>

                      <td className="px-6 py-3">
                        <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded w-fit ${product.status === 'published' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-100'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${product.status === 'published' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                          {product.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                        </span>
                      </td>

                      <td className="px-6 py-3">
                        <ProductActions id={product.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* فوتر: صفحه‌بندی (استفاده از Link برای پرهیز از کلاینت کامپوننت اضافی) */}
        {count > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                    نمایش {(page - 1) * limit + 1} تا {Math.min(page * limit, count)} از {count} محصول
                </span>
                
                <div className="flex gap-2">
                    {/* دکمه قبلی */}
                    {page > 1 ? (
                        <Link href={`?page=${page - 1}&q=${query}&order=${order}`}>
                            <Button variant="outline" size="sm" className="h-8 px-3 gap-1">
                                <ChevronRight className="w-4 h-4" /> قبلی
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" size="sm" disabled className="h-8 px-3 gap-1 opacity-50">
                             <ChevronRight className="w-4 h-4" /> قبلی
                        </Button>
                    )}
                    
                    <span className="flex items-center px-3 text-sm font-medium text-gray-700 bg-white border rounded shadow-sm h-8 min-w-[3rem] justify-center">
                        {page}
                    </span>

                    {/* دکمه بعدی */}
                    {page < totalPages ? (
                        <Link href={`?page=${page + 1}&q=${query}&order=${order}`}>
                            <Button variant="outline" size="sm" className="h-8 px-3 gap-1">
                                بعدی <ChevronLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" size="sm" disabled className="h-8 px-3 gap-1 opacity-50">
                            بعدی <ChevronLeft className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}