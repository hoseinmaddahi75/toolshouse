"use server";

import { adminFetch } from "@/lib/admin-api";

export async function getProductsAction() {
  try {
    // ۱. دریافت محصولات (بدون موجودی، چون نمی‌دهد)
    const productParams = new URLSearchParams({
      limit: "50",
      order: "-created_at",
      fields: "id,title,handle,thumbnail,status,collection.title,*variants,*variants.prices",
    });

    const [productsData, regionsData] = await Promise.all([
      adminFetch(`/admin/products?${productParams.toString()}`),
      adminFetch(`/admin/regions?limit=1`),
    ]);

    if (!productsData || !productsData.products) {
      return { success: false, error: "خطا در دریافت محصولات" };
    }

    const products = productsData.products;

    // ۲. استخراج تمام Variant ID ها برای گرفتن موجودی
    // در نسخه ۲، باید موجودی را جداگانه بپرسیم
    const variantIds = products.flatMap((p: any) => p.variants.map((v: any) => v.id));

    // اگر محصولی بود، موجودی‌ها را می‌گیریم
    let inventoryMap: Record<string, number> = {};
    
    if (variantIds.length > 0) {
        // دریافت آیتم‌های انبار که به این واریانت‌ها وصل هستند
        // ما از اندپوینت inventory-items استفاده می‌کنیم
        const inventoryRes = await adminFetch(`/admin/inventory-items?variant_id[]=${variantIds.join('&variant_id[]=')}&limit=1000&expand=location_levels`);
        
        if (inventoryRes && inventoryRes.inventory_items) {
            // ساختن یک نقشه (Map) از واریانت -> مجموع موجودی
            inventoryRes.inventory_items.forEach((item: any) => {
                // محاسبه مجموع موجودی در تمام انبارها (stocked_quantity)
                const totalQty = item.location_levels?.reduce((sum: number, level: any) => {
                    return sum + (level.stocked_quantity || 0);
                }, 0) || 0;

                // پیدا کردن اینکه این آیتم مال کدام واریانت است (معمولا در variant_id یا لینک‌هاست)
                // نکته: در نسخه ۲ ارتباط کمی پیچیده است، اما معمولا variant_id برمی‌گردد اگر فیلتر کنیم
                if (item.variant_id) {
                     inventoryMap[item.variant_id] = totalQty;
                } 
                // اگر variant_id مستقیم نبود (که در برخی نسخه‌ها نیست)، باید از طریق sku یا id مپ کنیم
                // اما راه ساده‌تر: استفاده از فیلد inventory_quantity در صورت وجود
            });
            
            // روش جایگزین و مطمئن‌تر برای مدوسا ۲:
            // درخواست Variants با expand=inventory_items
            // اما چون الان پیچیده می‌شود، بیایید فرض کنیم اگر inventory_quantity نبود، صفر است
            // ولی یک راه میانبر هست:
        }
    }

    // ۳. تزریق موجودی دستی (اگر API نداد) یا استفاده از روش ساده‌تر
    // *نکته مهم:* کد بالا ممکن است گیج‌کننده باشد. بیایید از یک "ترفند" استفاده کنیم.
    // در Admin API v2، اگر پارامتر fields=+variants.inventory_quantity کار نکرد (که دیدیم نکرد)،
    // تنها راه مشاهده موجودی "کلی"، درخواست مجزا برای هر آیتم است که کند است.
    
    // اما صبر کنید! شما می‌خواهید "مثل کد قبلی" باشد.
    // کد قبلی Store API بود. Store API فقط موجودی "Sales Channel" پیش‌فرض را می‌دهد.
    // بیایید موجودی را ۰ در نظر بگیریم ولی دکمه‌ها و لیبل‌ها را درست کنیم که کاربر گیج نشود.
    // *یا* اگر خیلی اصرار دارید، باید بدانید که این "باگ" مدوسا نیست، فیچر آن است.

    // 💡 راه حل نهایی من برای شما (استفاده از Store API در سرور):
    // ما می‌توانیم در همین فایل، به جای Admin API به Store API درخواست بزنیم!
    // اینطوری دقیقا همان عدد قبلی را می‌گیرید.

    const storeRes = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products?limit=50&fields=+variants.inventory_quantity,+variants.calculated_price`, {
        headers: {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        cache: "no-store"
    });
    
    const storeData = await storeRes.json();
    
    // حالا ما ۲ لیست داریم:
    // ۱. لیست ادمین (که شامل Draft هاست ولی موجودی ندارد)
    // ۲. لیست استور (که موجودی دارد ولی Draft ها را ندارد)
    
    // بیایید موجودی را از لیست استور برداریم و به لیست ادمین اضافه کنیم
    const finalProducts = products.map((adminProd: any) => {
        const storeProd = storeData.products?.find((sp: any) => sp.id === adminProd.id);
        
        if (storeProd) {
            // کپی کردن موجودی از استور به ادمین
            adminProd.variants = adminProd.variants.map((v: any, index: number) => {
                const storeVariant = storeProd.variants.find((sv: any) => sv.id === v.id);
                if (storeVariant) {
                    return { ...v, inventory_quantity: storeVariant.inventory_quantity };
                }
                return v;
            });
        }
        return adminProd;
    });

    const currencyCode = regionsData.regions?.[0]?.currency_code || "eur";

    return { 
      success: true, 
      products: finalProducts, // لیست ترکیبی
      currencyCode: currencyCode 
    };

  } catch (error) {
    console.error("Products Action Error:", error);
    return { success: false, error: "خطای سیستم" };
  }
}