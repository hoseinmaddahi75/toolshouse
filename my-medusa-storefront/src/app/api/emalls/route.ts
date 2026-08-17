import { NextResponse } from "next/server";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic"; 

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

    let url = `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,*categories`;
    if (regionId) url += `&region_id=${regionId}`;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("خطا در ارتباط با بک‌اند مدوسا");

    const data = await res.json();
    const products = data.products || [];

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

    const emallsFeed = products.map((product: any) => {
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

      const categoryName = product.categories && product.categories.length > 0 
        ? product.categories[0].name 
        : "سایر";

      return {
        id: product.id,
        title: product.title,
        url: `${baseUrl}/products/${product.handle}`,
        price: bestPrice,
        old_price: bestOldPrice > bestPrice ? bestOldPrice : bestPrice,
        available: isAvailable ? "instock" : "outofstock",
        image: product.thumbnail || "",
        category: categoryName
      };
    });

    return NextResponse.json({
      max_pages: Math.ceil(data.count / limit), 
      products: emallsFeed 
    });

  } catch (error) {
    console.error("Emalls Feed API Error:", error);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}