"use client";

import { useState } from "react";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

interface ProductPricingFormProps {
  productId: string;
  variantId: string;
  initialBasePrice?: number;
  initialBasePriceId?: string;
  initialSalePrice?: number;
  initialSalePriceId?: string;
  adminToken: string;
}

/**
 * Renders the pricing form for a product variant in the admin dashboard.
 * Abstracts the complexity of Medusa Price Lists by presenting a simple base/sale price UI.
 */
export default function ProductPricingForm({
  productId,
  variantId,
  initialBasePrice = 0,
  initialBasePriceId,
  initialSalePrice = 0,
  initialSalePriceId,
  adminToken,
}: ProductPricingFormProps) {
  const [basePrice, setBasePrice] = useState<number | "">(initialBasePrice || "");
  const [salePrice, setSalePrice] = useState<number | "">(initialSalePrice || "");
  const [basePriceId, setBasePriceId] = useState<string | undefined>(initialBasePriceId);
  const [salePriceId, setSalePriceId] = useState<string | undefined>(initialSalePriceId);
  const [isLoading, setIsLoading] = useState(false);

  const PRICE_LIST_ID = process.env.NEXT_PUBLIC_GLOBAL_SALE_PRICE_LIST_ID;

  /**
   * Updates the core variant price (Base Price).
   */
  const updateBasePrice = async (amount: number) => {
    const priceEntry: Record<string, unknown> = { amount, currency_code: "irr" };
    if (basePriceId) priceEntry.id = basePriceId;

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/admin/products/${productId}/variants/${variantId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ prices: [priceEntry] }),
      }
    );

    if (!response.ok) throw new Error("Failed to update base price");

    const data = await response.json();
    const updatedVariant = data.product_variant || data.variant;
    const newBasePrice = updatedVariant?.prices?.find(
      (p: any) => (p.currency_code === "irr" || p.currency_code === "irt") && !p.price_list_id
    );
    if (newBasePrice?.id) setBasePriceId(newBasePrice.id);
  };

  /**
   * Upserts the discounted price into the global active sales Price List.
   */
  const updateSalePriceList = async (amount: number) => {
    if (!PRICE_LIST_ID) throw new Error("Price List ID is missing in env variables.");

    // شناسه‌ی قیمت تخفیف قبلی (اگر وجود داشته باشد) از قبل در دسترس است —
    // نیازی به GET جداگانه از price-lists/:id/prices نیست (آن endpoint در این نسخه از مدوسا وجود ندارد).
    const batchResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/admin/price-lists/${PRICE_LIST_ID}/prices/batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          create: [
            {
              variant_id: variantId,
              amount: amount,
              currency_code: "irr",
            },
          ],
          delete: salePriceId ? [salePriceId] : [],
        }),
      }
    );

    if (!batchResponse.ok) throw new Error("Failed to update sale price");

    const data = await batchResponse.json();
    setSalePriceId(data.created?.[0]?.id || undefined);
  };

  /**
   * Removes the variant from the global active sales Price List.
   */
  const removeSalePrice = async () => {
    if (!PRICE_LIST_ID || !salePriceId) return;

    const response = await fetch(
      `${MEDUSA_BACKEND_URL}/admin/price-lists/${PRICE_LIST_ID}/prices/batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ delete: [salePriceId] }),
      }
    );

    if (!response.ok) throw new Error("Failed to remove sale price");
    setSalePriceId(undefined);
  };

  /**
   * Handles form submission to orchestrate base and sale price updates.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedBase = Number(basePrice);
    const parsedSale = Number(salePrice);

    if (!parsedBase || parsedBase <= 0) {
      alert("وارد کردن قیمت اصلی الزامی است.");
      return;
    }

    setIsLoading(true);

    try {
      // گام اول: ذخیره قیمت اصلی محصول
      await updateBasePrice(parsedBase);

      // گام دوم: مدیریت قیمت تخفیف خورده
      if (parsedSale && parsedSale > 0 && parsedSale < parsedBase) {
        await updateSalePriceList(parsedSale);
      } else {
        // اگر فیلد تخفیف خالی بود یا مقدار نامعتبری داشت، آن را از لیست حراج حذف می‌کنیم
        await removeSalePrice();
      }

      alert("قیمت‌ها با موفقیت به‌روزرسانی شدند.");
    } catch (error) {
      console.error("Pricing update error:", error);
      alert("خطایی در ذخیره‌سازی قیمت رخ داد.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-xl bg-white shadow-sm" dir="rtl">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-3">تنظیمات قیمت</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">قیمت اصلی (ریال / تومان)</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="مثال: ۱۲۰۰۰۰"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">قیمت با تخفیف (اختیاری)</label>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-red-300"
            placeholder="در صورت عدم تخفیف، خالی بگذارید"
          />
        </div>

      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? "در حال ذخیره‌سازی..." : "ذخیره قیمت"}
        </button>
      </div>
    </form>
  );
}