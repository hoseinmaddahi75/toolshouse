import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const scope = req.scope;

  const productModule = scope.resolve(Modules.PRODUCT);
  const inventoryModule = scope.resolve(Modules.INVENTORY);
  const stockLocationModule = scope.resolve(Modules.STOCK_LOCATION);
  const pricingModule = scope.resolve(Modules.PRICING);
  const remoteQuery = scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  try {
    // ۱. دریافت تمام محصولات (به جای یک محصول) همراه با دسته‌بندی‌ها
    const products = await productModule.listProducts(
      {}, // فیلترها (می‌توانید limit را هم اینجا اضافه کنید)
      {
        relations: ["variants", "options", "images", "categories", "collection"],
        take: 500 // گرفتن تعداد بالا برای جدول گروهی
      }
    );

    // ۲. دریافت انبار پیش‌فرض
    const [locations] = await stockLocationModule.listStockLocations({}, { take: 1 });
    const defaultLocationId = locations?.id;

    // ۳. جمع‌آوری آیدیِ تمام واریانت‌های تمام محصولات
    const variantIds = products.flatMap(p => p.variants.map(v => v.id));

    if (variantIds.length === 0) {
        return res.json({ products: [] });
    }

    // ۴. دریافت لینک‌های انبار و قیمت با یک Remote Query سراسری
    const query = {
        entryPoint: "product_variant",
        fields: [
            "id", 
            "inventory_items.inventory_item_id",
            "price_set.id"
        ],
        variables: {
            filters: { id: variantIds }
        }
    };

    const links = await remoteQuery(query);
    
    // استخراج آیدی‌ها برای فچ‌های بعدی
    const linkMap = new Map();
    const inventoryItemIds: Set<string> = new Set();
    const priceSetIds: Set<string> = new Set();

    links.forEach((link: any) => {
        const invItemId = link.inventory_items?.[0]?.inventory_item_id;
        const priceSetId = link.price_set?.id;

        if (invItemId) inventoryItemIds.add(invItemId);
        if (priceSetId) priceSetIds.add(priceSetId);

        linkMap.set(link.id, { invItemId, priceSetId });
    });

    // ۵. دریافت موجودی‌ها به صورت یکجا
    let inventoryLevelsMap = new Map();
    if (inventoryItemIds.size > 0 && defaultLocationId) {
        const levels = await inventoryModule.listInventoryLevels({
            inventory_item_id: Array.from(inventoryItemIds),
            location_id: defaultLocationId
        });
        levels.forEach(l => {
            inventoryLevelsMap.set(l.inventory_item_id, l.stocked_quantity); // می‌توانی available_quantity را هم بگیری
        });
    }

    // ۶. دریافت قیمت‌ها به صورت یکجا
    let pricesMap = new Map();
    if (priceSetIds.size > 0) {
        const priceSets = await pricingModule.listPriceSets(
            { id: Array.from(priceSetIds) }, 
            { relations: ["prices"] }
        );

        priceSets.forEach(ps => {
            // در مدوسا v2 قیمت‌ها در rules هم ذخیره می‌شوند، اما برای سادگی اولین قیمت را می‌گیریم
            const firstPrice = ps.prices?.[0];
            if (firstPrice) {
                pricesMap.set(ps.id, {
                    amount: firstPrice.amount,
                    currency_code: firstPrice.currency_code
                });
            }
        });
    }

    // ۷. ترکیب نهایی تمام اطلاعات و ساخت خروجی
    const enrichedProducts = products.map(product => {
        const enrichedVariants = product.variants.map(variant => {
            const links = linkMap.get(variant.id) || {};
            
            // تخصیص موجودی
            const qty = links.invItemId ? (inventoryLevelsMap.get(links.invItemId) || 0) : 0;

            // تخصیص قیمت
            const priceData = links.priceSetId ? pricesMap.get(links.priceSetId) : null;
            const finalPrice = priceData ? priceData.amount : 0;
            const finalCurrency = priceData ? priceData.currency_code : "irr";

            return {
                ...variant,
                inventory_quantity: qty,
                inventory_item_id: links.invItemId,
                prices: [
                    {
                        amount: finalPrice,
                        currency_code: finalCurrency,
                        price_list_id: null // برای اینکه فرانت‌اند بفهمد این قیمت عادی است
                    }
                ]
            };
        });

        return { ...product, variants: enrichedVariants };
    });

    res.json({ products: enrichedProducts });

  } catch (error: any) {
    console.error("خطا در فچ گروهی:", error);
    res.status(500).json({ message: error.message });
  }
}