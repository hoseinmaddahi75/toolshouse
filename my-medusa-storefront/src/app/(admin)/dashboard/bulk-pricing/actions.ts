"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

type BulkUpdatePayload = {
  // ... (تایپ‌ها تغییری نمی‌کنند)
  product_id: string;
  variant_id: string;
  inventory_item_id?: string;
  price?: number;
  sale_price?: number | null;
  inventory_quantity?: number;
  volume_pricing?: { min_quantity: number; amount: number }[];
}[];

export async function updateBulkPricesAction(items: BulkUpdatePayload) {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    
    // 🌟 استخراج توکن
    const token = 
        cookieStore.get("_medusa_admin_token")?.value || 
        cookieStore.get("admin_token")?.value || 
        cookieStore.get("token")?.value || 
        cookieStore.get("jwt")?.value;

    const headers: Record<string, string> = { 
        "Content-Type": "application/json", 
        "Cookie": cookieString 
    };

    // 🌟 افزودن هدر تاییدیه ادمین
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // --- ۱. آپدیت قیمت‌های پایه ---
    const priceItems = items.filter(i => i.price !== undefined);
    if (priceItems.length > 0) {
      await Promise.all(
        priceItems.map(async (item) => {
          const res = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${item.product_id}/variants/${item.variant_id}`, {
            method: "POST", headers,
            body: JSON.stringify({ prices: [{ amount: item.price, currency_code: "irr" }] }),
          });
          if (!res.ok) throw new Error("خطا در آپدیت قیمت عادی");
        })
      );
    }

    // --- ۲. آپدیت موجودی انبار (دقیقاً کپی شده از منطق edit-product-form شما) ---
    const invItems = items.filter(i => i.inventory_quantity !== undefined);
    if (invItems.length > 0) {
      // پیدا کردن Location ID
      const locRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/stock-locations`, { headers });
      const locData = await locRes.json();
      const locationId = locData.stock_locations?.[0]?.id;

      if (!locationId) throw new Error("هیچ انباری در سیستم یافت نشد!");

      await Promise.all(invItems.map(async (item) => {
        let invItemId = item.inventory_item_id;

        // اگر آیدی موجودی ارسال نشده بود، آن را از واریانت استخراج می‌کنیم
        if (!invItemId) {
          const varRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${item.product_id}/variants/${item.variant_id}`, { headers });
          const varData = await varRes.json();
          invItemId = varData.variant?.inventory_item_id || varData.variant?.inventory_items?.[0]?.inventory_item_id || varData.variant?.inventory_items?.[0]?.id;
        }

        if (invItemId) {
          // مرحله ۱: متصل کردن آیتم به انبار (اگر متصل باشد استاتوس 400 می‌دهد که طبیعی است)
          const linkRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/inventory-items/${invItemId}/location-levels`, {
            method: "POST", headers,
            body: JSON.stringify({ location_id: locationId }),
          });

          // مرحله ۲: آپدیت تعداد موجودی
          if (linkRes.ok || linkRes.status === 400) {
            const updateRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/inventory-items/${invItemId}/location-levels/${locationId}`, {
              method: "POST", headers,
              body: JSON.stringify({ stocked_quantity: item.inventory_quantity }),
            });
            if (!updateRes.ok) throw new Error("خطا در آپدیت عدد موجودی");
          }
        }
      }));
    }

    // --- ۳. آپدیت قیمت‌های پلکانی ---
    const volumeItems = items.filter(i => i.volume_pricing !== undefined);
    if (volumeItems.length > 0) {
      const groupedByProduct: Record<string, { variant_id: string; volume_pricing: any }[]> = {};
      volumeItems.forEach(item => {
        if (!groupedByProduct[item.product_id]) groupedByProduct[item.product_id] = [];
        groupedByProduct[item.product_id].push({ variant_id: item.variant_id, volume_pricing: item.volume_pricing });
      });

      for (const [productId, changes] of Object.entries(groupedByProduct)) {
        const prodRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${productId}`, { headers });
        const prodData = await prodRes.json();
        const existingMetadata = prodData.product.metadata || {};
        const newVolumePricingMap = { ...(existingMetadata.volume_pricing || {}) };

        changes.forEach(change => {
          if (change.volume_pricing.length === 0) delete newVolumePricingMap[change.variant_id];
          else newVolumePricingMap[change.variant_id] = change.volume_pricing;
        });

        await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${productId}`, {
          method: "POST", headers,
          body: JSON.stringify({ metadata: { ...existingMetadata, volume_pricing: newVolumePricingMap } }),
        });
      }
    }

    // --- ۴. آپدیت قیمت‌های حراج ---
    const saleItems = items.filter(i => i.sale_price !== undefined);
    if (saleItems.length > 0) {
      let priceListId = process.env.NEXT_PUBLIC_GLOBAL_SALE_PRICE_LIST_ID;
      
      if (!priceListId) {
          const plRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/price-lists?type[]=sale&status[]=active`, { headers });
          const plData = await plRes.json();
          if (plData.price_lists && plData.price_lists.length > 0) {
              priceListId = plData.price_lists[0].id;
          } else {
              const createRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/price-lists`, {
                method: "POST", headers,
                body: JSON.stringify({ name: "حراج عمومی", description: "تخفیف‌های سیستم", type: "sale", status: "active", prices: [] }),
              });
              const createData = await createRes.json();
              priceListId = createData.price_list.id;
          }
      }

      if (priceListId) {
          const pricesRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/price-lists/${priceListId}`, { headers });
          const pricesData = await pricesRes.json();
          const existingPrices = pricesData.price_list.prices || [];

          const creates: any[] = []; const updates: any[] = []; const deletes: string[] = [];

          saleItems.forEach(item => {
            const existing = existingPrices.find((p: any) => p.variant_id === item.variant_id);
            if (item.sale_price === null) { if (existing) deletes.push(existing.id); } 
            else {
              if (existing) updates.push({ id: existing.id, amount: item.sale_price });
              else creates.push({ variant_id: item.variant_id, amount: item.sale_price, currency_code: "irr" });
            }
          });

          if (creates.length > 0 || updates.length > 0 || deletes.length > 0) {
            await fetch(`${MEDUSA_BACKEND_URL}/admin/price-lists/${priceListId}/prices/batch`, {
              method: "POST", headers,
              body: JSON.stringify({ creates, updates, deletes }),
            });
          }
      }
    }


    // --- ۵. بیدار کردن ربات باسلام (با رعایت ایمنی سرور و جلوگیری از فشار) ---
    const uniqueProductIds = Array.from(new Set(items.map(i => i.product_id)));

    // 🟢 استفاده از حلقه for به جای Promise.all برای ارسال یکی‌یکی درخواست‌ها
    for (const pid of uniqueProductIds) {
      try {
        const prodRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${pid}`, { headers });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const existingMetadata = prodData.product.metadata || {};

          // آپدیت نامرئی برای شلیک رویداد
          await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${pid}`, {
            method: "POST", 
            headers,
            body: JSON.stringify({ 
              metadata: { 
                ...existingMetadata, 
                last_bulk_sync: Date.now() 
              } 
            }),
          });
        }
      } catch (err) {
        console.error(`❌ خطا در بیدار کردن ربات برای محصول ${pid}:`, err);
      }
    }

    revalidatePath("/dashboard/bulk-pricing");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



// این تابع را به انتهای فایل actions.ts اضافه کنید
export async function checkRealInventoryAction(productId: string, variantId: string) {
  try {
    const cookieStore = await cookies();
    
    // استخراج توکن دقیقاً مثل توابع بالا
    const token = 
        cookieStore.get("_medusa_admin_token")?.value || 
        cookieStore.get("admin_token")?.value || 
        cookieStore.get("token")?.value || 
        cookieStore.get("jwt")?.value;

    const headers: Record<string, string> = { 
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // ۲. دریافت اطلاعات واریانت
    const varRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${productId}/variants/${variantId}`, { 
      headers,
      cache: 'no-store'
    });
    
    if (!varRes.ok) throw new Error("خطا در دریافت واریانت");
    
    const varData = await varRes.json();
    const inventoryItems = varData.variant?.inventory_items || [];
    
    if (inventoryItems.length === 0) {
      return { success: false, message: "این واریانت به سیستم انبارداری متصل نیست!" };
    }

    const invItemId = inventoryItems[0].inventory_item_id || inventoryItems[0].id;

    // ۳. دریافت موجودی واقعی از انبار
    const invRes = await fetch(`${MEDUSA_BACKEND_URL}/admin/inventory-items/${invItemId}`, { 
      headers,
      cache: 'no-store'
    });
    
    if (!invRes.ok) throw new Error("خطا در دریافت موجودی انبار");
    
    const invData = await invRes.json();

    return { 
      success: true, 
      invItemId,
      inventory_item: invData.inventory_item 
    };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}