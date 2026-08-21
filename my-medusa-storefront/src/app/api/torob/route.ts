import { NextResponse } from "next/server";
import { MEDUSA_BACKEND_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

// تابع کمکی برای پاک کردن تگ‌های HTML و فاصله‌های اضافی
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
};

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    let body: any = {};
    if (bodyText) {
      body = JSON.parse(bodyText);
    }

    // ۱. اعتبارسنجی دقیق طبق دستورالعمل ترب (ارور 400)
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Request body cannot be empty" }, { status: 400 });
    }
    if (body.page && !body.sort) {
      return NextResponse.json({ error: "sort parameter is not provided" }, { status: 400 });
    }
    if (!body.page && !body.page_urls && !body.page_uniques) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    let limit = 100;
    let offset = 0;
    let handleFilter = "";
    let idFilter = "";

    if (body.page) {
      offset = (parseInt(body.page) - 1) * limit;
    } else if (body.page_urls) {
      // پیدا کردن دستگیره (handle) از آدرس‌های ارسالی ترب
      const handles = body.page_urls.map((url: string) => {
        const parts = url.split("/");
        return parts[parts.length - 1] || parts[parts.length - 2];
      });
      // فرض بر این است که ترب در این مرحله فقط یک لینک درخواست می‌کند
      if (handles.length > 0) handleFilter = `&handle=${handles[0]}`;
    } else if (body.page_uniques) {
      // آیدی‌های محصولات از سمت ترب
      if (body.page_uniques.length > 0) idFilter = `&id=${body.page_uniques[0]}`;
    }

    const headers = {
      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      "Content-Type": "application/json",
    };

    // دریافت Region ID
    const regionRes = await fetch(`${MEDUSA_BACKEND_URL}/store/regions?limit=1`, { headers, cache: "no-store" });
    const regionData = await regionRes.json();
    const regionId = regionData.regions?.[0]?.id;

    let url = `${MEDUSA_BACKEND_URL}/store/products?limit=${limit}&offset=${offset}&fields=*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,+variants.prices,+subtitle,+description,+metadata,*images`;
    if (regionId) url += `&region_id=${regionId}`;
    if (handleFilter) url += handleFilter;
    if (idFilter) url += idFilter;

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error("خطا در ارتباط با بک‌اند مدوسا");

    const data = await res.json();
    const products = data.products || [];

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://daroobarg.com";
    const torobProducts: any[] = [];

    products.forEach((product: any) => {
      // برای ترب باید تمام متغیرهای یک محصول را به عنوان آیتم‌های جداگانه اما هم‌گروه بفرستیم
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
          const qty = v.inventory_quantity || 0;
          const manageInv = v.manage_inventory;
          const allowBackorder = v.allow_backorder;

          const isAvailable = !manageInv || allowBackorder || qty > 0;

          let currentVPrice = 0;
          let currentVOldPrice = 0;

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

          const rawSubtitle = product.subtitle || product.metadata?.seo_description || product.description || "";
          const cleanSubtitle = stripHtml(rawSubtitle).substring(0, 490);
          
          const images = product.images?.map((img: any) => img.url) || [];

          torobProducts.push({
            page_unique: v.id, // شناسه یکتای متغیر برای ترب
            page_url: `${baseUrl}/products/${product.handle}`, // لینک کامل محصول
            product_group_id: product.id, // برای یکی کردن متغیرهای یک محصول
            title: product.variants.length > 1 ? `${product.title} - ${v.title}` : product.title,
            subtitle: cleanSubtitle,
            current_price: currentVPrice,
            old_price: currentVOldPrice > currentVPrice ? currentVOldPrice : currentVPrice,
            availability: isAvailable,
            category_name: product.categories?.[0]?.name || "",
            image_links: images.length > 0 ? images : [product.thumbnail || ""],
            short_desc: cleanSubtitle,
            spec: {},
            date_added: product.created_at || new Date().toISOString(),
            date_updated: product.updated_at || new Date().toISOString()
          });
        });
      }
    });

    return NextResponse.json({
      api_version: "torob_api_v3",
      current_page: body.page ? parseInt(body.page) : 1,
      total: data.count || torobProducts.length,
      max_pages: data.count ? Math.ceil(data.count / limit) : 1,
      products: torobProducts
    });

  } catch (error) {
    console.error("Torob Feed API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}