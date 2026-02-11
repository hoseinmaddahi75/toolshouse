import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { ContainerRegistrationKeys } from "@medusajs/utils";

// --- تنظیمات ---
const CONVERT_TOMAN_TO_RIAL = true; 

// --- توابع کمکی ---
function sanitizeHandle(input: string | undefined): string {
  if (!input || input.trim().length === 0) {
    return `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  let handle = input.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");
  if (handle.length === 0) return `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return handle;
}

function generateCombinations(options: any[]) {
  if (!options || options.length === 0) return [];
  let combinations: Record<string, string>[] = options[0].values.map((val: string) => ({
    [options[0].title]: val
  }));
  for (let i = 1; i < options.length; i++) {
    const currentOption = options[i];
    const newCombinations: Record<string, string>[] = [];
    combinations.forEach(existingCombo => {
      currentOption.values.forEach((val: string) => {
        newCombinations.push({ ...existingCombo, [currentOption.title]: val });
      });
    });
    combinations = newCombinations;
  }
  return combinations;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const scope = req.scope;
  const productModule = scope.resolve(Modules.PRODUCT);
  const inventoryModule = scope.resolve(Modules.INVENTORY);
  const stockLocationModule = scope.resolve(Modules.STOCK_LOCATION);
  const pricingModule = scope.resolve(Modules.PRICING);
  const remoteLink = scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);
  const storeModule = scope.resolve(Modules.STORE);

  // variants: آرایه‌ای است که از فرانت می‌آید و شامل قیمت/موجودی برای هر ترکیب است
  const { title, description, thumbnail, handle, status, options, variants } = req.body as any;

  try {
    // 1. دریافت تنظیمات فروشگاه
    const [store] = await storeModule.listStores({}, {
      relations: ["supported_currencies"]
    });
    
    const targetCurrency = store.supported_currencies?.find(c => c.currency_code === "irr") 
      ? "irr" 
      : store.supported_currencies?.[0]?.currency_code || "usd";

    const safeHandle = sanitizeHandle(handle || title);
    const productOptions = options?.map((opt: any) => ({
      title: opt.title,
      values: opt.values || [] 
    })) || [];

    // 2. ساخت محصول پایه
    console.log("🏗️ Creating Product Base...");
    const [product] = await productModule.createProducts([{
      title,
      handle: safeHandle,
      description,
      thumbnail,
      status,
      options: productOptions,
    }]);

    // 3. تولید داده‌های واریانت
    let variantsData: any[] = [];
    
    // اگر محصول متغیر است
    if (productOptions.length > 0) {
      const combos = generateCombinations(productOptions);
      
      variantsData = combos.map((combo, index) => {
        // 🚨 اصلاح مهم: دریافت اطلاعات از ورودی متناظر با ایندکس
        // فرض بر این است که ترتیب ترکیب‌ها در فرانت و بکند یکسان است (که هست)
        const inputVariant = variants[index];
        
        // استخراج قیمت مخصوص این واریانت
        let rawPrice = 0;
        if (inputVariant && inputVariant.prices && inputVariant.prices[0]) {
            rawPrice = Number(inputVariant.prices[0].amount);
        }

        // تبدیل ارز مخصوص این واریانت
        if (CONVERT_TOMAN_TO_RIAL && targetCurrency === "irr") {
            rawPrice = rawPrice * 10;
        }

        // استخراج موجودی مخصوص این واریانت
        const rawStock = inputVariant ? parseInt(inputVariant.inventory_quantity || "0") : 0;

        return {
          product_id: product.id,
          title: Object.values(combo).join(" / "),
          options: combo,
          sku: `${safeHandle}-${index}-${Date.now()}`,
          manage_inventory: true, 
          allow_backorder: false,
          // ذخیره موقت قیمت و موجودی در آبجکت برای استفاده در مرحله بعد
          _temp_price: rawPrice,
          _temp_stock: rawStock
        };
      });
    } 
    // اگر محصول ساده است
    else {
      const inputVariant = variants ? variants[0] : null;
      let rawPrice = inputVariant?.prices?.[0]?.amount || 0;
      if (CONVERT_TOMAN_TO_RIAL && targetCurrency === "irr") rawPrice *= 10;
      const rawStock = inputVariant ? parseInt(inputVariant.inventory_quantity || "0") : 0;

      variantsData = [{
        product_id: product.id,
        title: "Default",
        options: {},
        sku: `${safeHandle}-def`,
        manage_inventory: true,
        allow_backorder: false,
        _temp_price: rawPrice,
        _temp_stock: rawStock
      }];
    }

    // 4. ساخت واریانت‌ها در دیتابیس
    let createdVariants: any[] = [];
    if (variantsData.length > 0) {
      createdVariants = await productModule.createProductVariants(variantsData);
    }

    // 5. اتصال لینک‌ها (با استفاده از مقادیر اختصاصی هر واریانت)
    if (createdVariants.length > 0) {
      const locations = await stockLocationModule.listStockLocations({}, { take: 1 });
      const locationId = locations[0]?.id;

      if (!locationId) throw new Error("No Stock Location found!");

      // حلقه روی واریانت‌های ساخته شده
      for (let i = 0; i < createdVariants.length; i++) {
        const variant = createdVariants[i];
        
        // 🚨 دریافت اطلاعات ذخیره شده (قیمت و موجودی خاص این آیتم)
        // variantsData دقیقا هم‌تراز با createdVariants است
        const initialData = variantsData[i]; 
        const stockQty = initialData._temp_stock;
        const priceAmt = initialData._temp_price;

        console.log(`🔗 Linking Variant ${i}: Price=${priceAmt}, Stock=${stockQty}`);

        // --- A. INVENTORY ---
        const inventoryItem = await inventoryModule.createInventoryItems({
          sku: variant.sku,
          requires_shipping: true,
        });

        await inventoryModule.createInventoryLevels([{
          inventory_item_id: inventoryItem.id,
          location_id: locationId,
          stocked_quantity: stockQty, // مقدار صحیح
        }]);

        await remoteLink.create([
          {
            [Modules.PRODUCT]: { variant_id: variant.id },
            [Modules.INVENTORY]: { inventory_item_id: inventoryItem.id },
          },
        ]);

        // --- B. PRICING ---
        const priceSet = await pricingModule.createPriceSets({
          prices: [
            {
              amount: priceAmt, // مبلغ صحیح
              currency_code: targetCurrency, 
              min_quantity: null,
              max_quantity: null,
            }
          ]
        });

        await remoteLink.create([
          {
            [Modules.PRODUCT]: { variant_id: variant.id },
            [Modules.PRICING]: { price_set_id: priceSet.id },
          },
        ]);
      }
    }

    res.json({ 
        message: "Product created successfully!", 
        product_id: product.id
    });

  } catch (error: any) {
    console.error("❌ ERROR:", error);
    res.status(400).json({ message: error.message });
  }
}