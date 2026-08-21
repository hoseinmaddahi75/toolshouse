"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, PackageOpen, AlertCircle, ChevronRight, ChevronLeft, Filter, ArrowDownUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateBulkPricesAction, checkRealInventoryAction } from "./actions";

interface BulkPricingClientProps {
  initialProducts: any[];
}

const formatNumber = (num: number | string | null) => {
  if (num === null || num === undefined || num === "") return "";
  return new Intl.NumberFormat("fa-IR").format(Number(num));
};

const toEnglishDigits = (str: string) => {
  if (typeof str !== "string") return str;
  const persian = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabic = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  let result = str;
  for (let i = 0; i < 10; i++) result = result.replace(persian[i], String(i)).replace(arabic[i], String(i));
  return result;
};

export default function BulkPricingClient({ initialProducts }: BulkPricingClientProps) {

  const checkRealInventory = async () => {
    try {
      const testProduct = initialProducts.find(p => p.variants && p.variants.length > 0);
      if (!testProduct) return;
      
      const testVariantId = testProduct.variants[0].id;
      const result = await checkRealInventoryAction(testProduct.id, testVariantId);
      
      if (!result.success) return;
    } catch (error) {
      console.error("خطا در اجرای تست انبار:", error);
    }
  };

  useEffect(() => {
    checkRealInventory();
  }, [initialProducts]);

  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [isSaving, setIsSaving] = useState(false);

  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [editedSalePrices, setEditedSalePrices] = useState<Record<string, number | null>>({});
  const [editedInventory, setEditedInventory] = useState<Record<string, number>>({});
  
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    initialProducts.forEach(p => {
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach((c: any) => cats.add(c.name));
      }
    });
    return Array.from(cats);
  }, [initialProducts]);

  const processedProducts = useMemo(() => {
    let result = [...initialProducts];

    if (searchTerm) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.variants?.some((v: any) => v.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      result = result.filter(p => 
        p.categories?.some((c: any) => c.name === selectedCategory)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "title_desc") return b.title.localeCompare(a.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialProducts, searchTerm, selectedCategory, sortBy]);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedCategory, sortBy]);

  const totalPages = Math.ceil(processedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = processedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const dirtyVariantIds = new Set([...Object.keys(editedPrices), ...Object.keys(editedSalePrices), ...Object.keys(editedInventory)]);
  const dirtyCount = dirtyVariantIds.size;

  const handleChange = (variantId: string, originalValue: any, rawValue: string, setter: any, allowNull = false) => {
    const cleanValue = toEnglishDigits(rawValue).replace(/\D/g, "");
    const newValue = cleanValue === "" && allowNull ? null : (cleanValue ? Number(cleanValue) : 0);
    setter((prev: any) => {
      const newState = { ...prev };
      if (newValue === originalValue) delete newState[variantId];
      else newState[variantId] = newValue;
      return newState;
    });
  };

  const handleBulkSave = async () => {
    if (dirtyCount === 0) return;
    setIsSaving(true);
    try {
      const payload = Array.from(dirtyVariantIds).map((variantId) => {
        const parentProduct = initialProducts.find(p => p.variants?.some((v:any) => v.id === variantId));
        const targetVariant = parentProduct?.variants?.find((v:any) => v.id === variantId);
        
        const invItemId = targetVariant?.inventory_item_id || targetVariant?.inventory_items?.[0]?.inventory_item_id || targetVariant?.inventory_items?.[0]?.id;

        return {
          product_id: parentProduct?.id || "",
          variant_id: variantId,
          inventory_item_id: invItemId, 
          price: editedPrices[variantId],
          sale_price: editedSalePrices[variantId],
          inventory_quantity: editedInventory[variantId],
        };
      });

      const result = await updateBulkPricesAction(payload);
      if (!result.success) throw new Error(result.error);

      toast.success("تغییرات اعمال شد!", { description: `${formatNumber(dirtyCount)} متغیر در سایت به‌روزرسانی شد.` });
      setEditedPrices({}); setEditedSalePrices({}); setEditedInventory({});
      router.refresh(); 
    } catch (error: any) {
      toast.error("خطا در ذخیره", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative pb-24 space-y-6">
      <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">مدیریت جامع انبار و قیمت</h1>
            <p className="text-sm text-gray-500 mt-1">مدیریت قیمت پایه، حراج و موجودی محصولات.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input type="text" className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="جستجوی محصول یا متغیر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-gray-500" /></div>
              <select className="block w-full pl-3 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none appearance-none bg-gray-50" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">همه دسته‌بندی‌ها</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><ArrowDownUp className="h-4 w-4 text-gray-500" /></div>
              <select className="block w-full pl-3 pr-9 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none appearance-none bg-gray-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">جدیدترین محصولات</option>
                <option value="title_asc">حروف الفبا (الف تا ی)</option>
                <option value="title_desc">حروف الفبا (ی تا الف)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 font-medium w-auto">محصول / متغیر</th>
                <th className="px-4 py-4 font-medium w-40">موجودی انبار</th>
                <th className="px-4 py-4 font-medium w-48">قیمت عادی (ریال)</th>
                <th className="px-4 py-4 font-medium w-48">قیمت حراج (ریال)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => {
                const isSingleDefault = product.variants?.length === 1 && 
                  (product.variants[0].title === "Default Title" || product.variants[0].title === "Default Variant");

                const renderVariantInputs = (variant: any) => {
                  const basePriceObj = variant.prices?.find((pr: any) => !pr.price_list_id);
                  const salePriceObj = variant.prices?.find((pr: any) => pr.price_list_id);
                  const originalPrice = basePriceObj ? basePriceObj.amount : 0;
                  const originalSalePrice = salePriceObj ? salePriceObj.amount : null;
                  const originalInventory = variant.inventory_quantity || 0;
                  
                  const isPriceEdited = editedPrices[variant.id] !== undefined;
                  const isSaleEdited = editedSalePrices[variant.id] !== undefined;
                  const isInvEdited = editedInventory[variant.id] !== undefined;
                  
                  return (
                    <Fragment>
                      <td className="px-4 py-3">
                        <input type="text" dir="ltr" placeholder="0" className={`w-full p-2 border rounded-md text-center text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 ${isInvEdited ? "border-yellow-400 bg-yellow-50 text-blue-700" : "border-gray-200 bg-white"}`} value={formatNumber(isInvEdited ? editedInventory[variant.id] : originalInventory)} onChange={(e) => handleChange(variant.id, originalInventory, e.target.value, setEditedInventory)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" dir="ltr" placeholder="0" className={`w-full p-2 border rounded-md text-left text-sm font-bold outline-none focus:ring-2 focus:ring-black ${isPriceEdited ? "border-yellow-400 bg-yellow-50 text-yellow-900" : "border-gray-200 bg-white"}`} value={formatNumber(isPriceEdited ? editedPrices[variant.id] : originalPrice)} onChange={(e) => handleChange(variant.id, originalPrice, e.target.value, setEditedPrices)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" dir="ltr" placeholder="بدون تخفیف" className={`w-full p-2 border rounded-md text-left text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-400 ${isSaleEdited ? "border-yellow-400 bg-yellow-50 text-red-600" : "border-gray-200 bg-white text-red-600"}`} value={formatNumber(isSaleEdited ? editedSalePrices[variant.id] : originalSalePrice)} onChange={(e) => handleChange(variant.id, originalSalePrice, e.target.value, setEditedSalePrices, true)} />
                      </td>
                    </Fragment>
                  );
                };

                return (
                  <Fragment key={product.id}>
                    {isSingleDefault ? (
                      <tr className={`border-b border-gray-100 ${dirtyVariantIds.has(product.variants[0].id) ? "bg-yellow-50/40" : "hover:bg-gray-50/50"}`}>
                        <td className="px-6 py-3 font-bold text-gray-900">
                          {/* 🔗 لینک‌دار شدن محصول ساده */}
                          <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 hover:text-blue-600 transition-colors group">
                            <div className="w-8 h-8 bg-white rounded overflow-hidden border shrink-0 group-hover:border-blue-300">
                              {product.thumbnail ? <img src={product.thumbnail} alt="" className="w-full h-full object-cover" /> : <PackageOpen className="w-4 h-4 m-auto mt-2 text-gray-300" />}
                            </div>
                            <span>{product.title}</span>
                          </Link>
                        </td>
                        {renderVariantInputs(product.variants[0])}
                      </tr>
                    ) : (
                      <Fragment>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td colSpan={4} className="px-6 py-3 font-bold text-gray-900">
                            {/* 🔗 لینک‌دار شدن محصول متغیر (ردیف مادر) */}
                            <Link href={`/dashboard/products/${product.id}`} className="flex items-center gap-3 hover:text-blue-600 transition-colors group w-fit">
                              <div className="w-8 h-8 bg-white rounded overflow-hidden border shrink-0 group-hover:border-blue-300">
                                {product.thumbnail ? <img src={product.thumbnail} alt="" className="w-full h-full object-cover" /> : <PackageOpen className="w-4 h-4 m-auto mt-2 text-gray-300" />}
                              </div>
                              <span>{product.title}</span>
                            </Link>
                          </td>
                        </tr>
                        {product.variants?.map((variant: any) => (
                          <tr key={variant.id} className={`transition-colors ${dirtyVariantIds.has(variant.id) ? "bg-yellow-50/40" : "hover:bg-gray-50/50"}`}>
                            <td className="px-6 py-3 pr-12 text-gray-600 font-medium">
                              <span className="text-gray-300 ml-2">↳</span>
                              {variant.title}
                            </td>
                            {renderVariantInputs(variant)}
                          </tr>
                        ))}
                      </Fragment>
                    )}
                  </Fragment>
                );
              })}

              {paginatedProducts.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">موردی یافت نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-gray-50 p-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-500">صفحه {formatNumber(currentPage)} از {formatNumber(totalPages)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronRight className="w-4 h-4 ml-1" /> قبلی</Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>بعدی <ChevronLeft className="w-4 h-4 mr-1" /></Button>
            </div>
          </div>
        )}
      </div>

      {dirtyCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full"><AlertCircle className="w-5 h-5" /></div>
            <div><div className="font-bold">تغییرات ذخیره نشده</div><div className="text-sm text-gray-400">شما اطلاعات {formatNumber(dirtyCount)} متغیر را تغییر داده‌اید.</div></div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={() => { setEditedPrices({}); setEditedSalePrices({}); setEditedInventory({}); }}>انصراف</Button>
            <Button onClick={handleBulkSave} disabled={isSaving} className="bg-white text-gray-900 hover:bg-gray-100 px-6 font-bold">{isSaving ? "در حال ذخیره..." : "ذخیره در دیتابیس"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}