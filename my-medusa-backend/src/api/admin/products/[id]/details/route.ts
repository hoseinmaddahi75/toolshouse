import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const scope = req.scope;

  const productModule = scope.resolve(Modules.PRODUCT);
  const inventoryModule = scope.resolve(Modules.INVENTORY);
  const stockLocationModule = scope.resolve(Modules.STOCK_LOCATION);
  const pricingModule = scope.resolve(Modules.PRICING); // ✅ ماژول قیمت اضافه شد
  const remoteQuery = scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

  try {
    // 1. دریافت محصول
    const product = await productModule.retrieveProduct(id, {
      relations: ["variants", "options", "images", "categories"]
    });

    // 2. دریافت انبار
    const [locations] = await stockLocationModule.listStockLocations({}, { take: 1 });
    const defaultLocationId = locations?.id;

    // 3. دریافت لینک‌ها (لینک به انبار و لینک به ست قیمت)
    const variantIds = product.variants.map(v => v.id);

    const query = {
        entryPoint: "product_variant",
        fields: [
            "id", 
            "inventory_items.inventory_item_id",
            "price_set.id" // ✅ فقط آیدی ست قیمت را می‌گیریم (مطمئن‌تر)
        ],
        variables: {
            filters: {
                id: variantIds
            }
        }
    };

    const links = await remoteQuery(query);
    
    // استخراج آیدی‌ها برای درخواست‌های بعدی
    const linkMap = new Map(); // variant_id => { invItemId, priceSetId }
    const inventoryItemIds: string[] = [];
    const priceSetIds: string[] = [];

    links.forEach((link: any) => {
        const invItemId = link.inventory_items?.[0]?.inventory_item_id;
        const priceSetId = link.price_set?.id;

        if (invItemId) inventoryItemIds.push(invItemId);
        if (priceSetId) priceSetIds.push(priceSetId);

        linkMap.set(link.id, { invItemId, priceSetId });
    });

    // 4. دریافت موجودی‌ها (از Inventory Module)
    let inventoryLevelsMap = new Map();
    if (inventoryItemIds.length > 0 && defaultLocationId) {
        const levels = await inventoryModule.listInventoryLevels({
            inventory_item_id: inventoryItemIds,
            location_id: defaultLocationId
        });
        levels.forEach(l => {
            inventoryLevelsMap.set(l.inventory_item_id, l.stocked_quantity);
        });
    }

    // 5. دریافت قیمت‌ها (از Pricing Module) 💰
    let pricesMap = new Map();
    if (priceSetIds.length > 0) {
        // دریافت تمام قیمت‌های مربوط به این Price Set ها
        const priceSets = await pricingModule.listPriceSets({
            id: priceSetIds
        }, {
            relations: ["prices"]
        });

        priceSets.forEach(ps => {
            // فعلا اولین قیمت را برمی‌داریم (معمولاً قیمت پیش‌فرض)
            const firstPrice = ps.prices?.[0];
            if (firstPrice) {
                pricesMap.set(ps.id, {
                    amount: firstPrice.amount,
                    currency_code: firstPrice.currency_code
                });
            }
        });
    }

    // 6. ترکیب نهایی
    const enrichedVariants = product.variants.map(variant => {
        const links = linkMap.get(variant.id) || {};
        
        // پیدا کردن موجودی
        const qty = links.invItemId ? (inventoryLevelsMap.get(links.invItemId) || 0) : 0;

        // پیدا کردن قیمت
        const priceData = links.priceSetId ? pricesMap.get(links.priceSetId) : null;
        const finalPrice = priceData ? priceData.amount : 0;
        const finalCurrency = priceData ? priceData.currency_code : "irr";

        return {
            ...variant,
            inventory_quantity: qty,
            inventory_item_id: links.invItemId,
            // فرمت استاندارد برای فرانت‌‌اند
            prices: [
                {
                    amount: finalPrice,
                    currency_code: finalCurrency
                }
            ]
        };
    });

    res.json({
      product: {
        ...product,
        variants: enrichedVariants
      }
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}