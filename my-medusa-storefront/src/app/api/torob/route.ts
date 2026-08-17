import { NextResponse } from "next/server";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic"; 

// 🟢 تابع کمکی برای پاک کردن تگ‌های HTML و فاصله‌های اضافی
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 100; 
    const offset = (page - 1) * limit;

    const headers = {
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      "Content-Type": "application/json",
    };

    const regionRes = await fetch(`${MEDUSA_BACKEND_URL}/store/regions?limit=1`, { headers, cache: "no-store" });
    const regionData = await regionRes.json();
    const regionId = regionData.regions?.[0]?.id;

    // 🟢 اضافه شدن metadata و description به لیست فیلدهای درخواستی
    let url = `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+subtitle,+description,+metadata`;
    if (regionId) url += `&region_id=${regionId}`;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("خطا در ارتباط با بک‌اند مدوسا");

    const data = await res.json();
    const products = data.products || [];

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

    const torobFeed = products.map((product: any) => {
      let bestPrice = Infinity;
      let bestOldPrice = Infinity;
      let isAvailable = false;

      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
          const qty = v.inventory_quantity || 0;
          const manageInv = v.manage_inventory;
          const allowBackorder = v.allow_backorder;

          const variantInStock = !manageInv || allowBackorder || qty > 0;
          if (variantInStock) isAvailable = true;

          let currentVPrice = null;
          let currentVOldPrice = null;

          if (v.calculated_price) {
            currentVPrice = v.calculated_price.calculated_amount;
            currentVOldPrice = v.calculated_price.original_amount;
          } else if (v.prices && v.prices.length > 0) {
            const irrPrice = v.prices.find((p: any) => p.currency_code === "irr" || p.currency_code === "IRR");
            if (irrPrice) {
              currentVPrice = irrPrice.amount;
              currentVOldPrice = irrPrice.amount;
            }
          }

          if (currentVPrice !== null && variantInStock) {
            if (currentVPrice < bestPrice) {
              bestPrice = currentVPrice;
              bestOldPrice = currentVOldPrice || currentVPrice;
            }
          }
        });
      }

      if (bestPrice === Infinity) {
        bestPrice = 0;
        bestOldPrice = 0;
      }

      // 🟢 سیستم پشتیبان (Fallback) و پاکسازی HTML برای ترب
      const rawSubtitle = product.subtitle || product.metadata?.seo_description || product.description || "";
      // برش متن به 300 کاراکتر تا فایل JSON برای ترب سنگین نشود
      const cleanSubtitle = stripHtml(rawSubtitle).substring(0, 300);

      return {
        product_id: product.id,
        page_url: `${baseUrl}/products/${product.handle}`,
        price: bestPrice, 
        old_price: bestOldPrice > bestPrice ? bestOldPrice : bestPrice, 
        availability: isAvailable ? "instock" : "outofstock", 
        image_url: product.thumbnail || "",
        title: product.title,
        subtitle: cleanSubtitle, // 🟢 ارسال متن کاملاً پاکیزه و بدون کد HTML
      };
    });

    return NextResponse.json({
      max_pages: Math.ceil(data.count / limit), 
      products: torobFeed 
    });

  } catch (error) {
    console.error("Torob Feed API Error:", error);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}