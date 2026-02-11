// src/scripts/sync-inventory-wp.ts
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { IInventoryService, IProductModuleService, IStockLocationService } from "@medusajs/framework/types";
import axios from "axios";
import https from "https";

// 👇 رمز عبور صحیح شما
const WP_CONFIG = {
  url: "https://toolshouse.ir", 
  username: "cp58117", 
  appPassword: "aMaa2pv1WXJbfte0iUZ1dSgr", 
  perPage: 10, 
};

// تابع کمکی برای نرمال‌سازی متن (حذف فاصله‌های اضافی برای اطمینان از تطابق)
const normalizeText = (text: string) => {
    if (!text) return "";
    return text.trim().toLowerCase().replace(/\s+/g, " "); // تبدیل چند اسپیس به یک اسپیس
};

export default async function syncInventory({ container }: ExecArgs) {
  console.log("🚀 Starting Inventory Sync (Strategy: TITLE MATCHING)...");

  // احراز هویت
  const cleanUsername = WP_CONFIG.username.trim();
  const cleanPassword = WP_CONFIG.appPassword.trim();
  const agent = new https.Agent({ rejectUnauthorized: false });
  const authHeader = Buffer.from(`${cleanUsername}:${cleanPassword}`).toString('base64');
  
  const axiosConfig = {
    httpsAgent: agent,
    headers: {
      "Authorization": `Basic ${authHeader}`,
      "User-Agent": "Mozilla/5.0 (MedusaSync Bot)",
      "Content-Type": "application/json"
    },
    timeout: 30000 
  };

  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);
  const inventoryService: IInventoryService = container.resolve(Modules.INVENTORY);
  const stockLocationService: IStockLocationService = container.resolve(Modules.STOCK_LOCATION);
  const remoteLink: any = container.resolve("remoteLink");

  // 1. دریافت لوکیشن انبار
  const [locations] = await stockLocationService.listStockLocations({}, { take: 1 });
  let locationId = locations?.[0]?.id;

  if (!locationId) {
    const newLoc = await stockLocationService.createStockLocations({ name: "Default Location" });
    locationId = newLoc.id;
  }
  console.log(`📍 Using Stock Location ID: ${locationId}`);

  // 2. دریافت محصولات مدوسا
  console.log("📦 Fetching Medusa products...");
  const [medusaProducts, count] = await productService.listAndCountProducts({}, { 
    select: ["id", "title", "handle", "variants.id", "variants.sku"], // Title اینجا حیاتی است
    relations: ["variants"],
    take: 10000 
  });
  console.log(`✅ Loaded ${count} products from Medusa.`);

  // 3. شروع حلقه دریافت از وردپرس
  let page = 1;
  let keepFetching = true;
  let consecutiveErrors = 0;
  let totalUpdated = 0;

  while (keepFetching) {
    try {
      console.log(`🔄 Processing WP Page ${page}...`);
      
      const response = await axios.get(`${WP_CONFIG.url}/wp-json/wc/v3/products`, {
        ...axiosConfig,
        params: { 
          per_page: WP_CONFIG.perPage,
          page: page,
          status: "publish"
        },
      });

      const wpBatch = response.data;

      if (!Array.isArray(wpBatch)) {
        console.log("⏳ Invalid response. Waiting 30s...");
        await new Promise(resolve => setTimeout(resolve, 30000));
        continue; 
      }

      consecutiveErrors = 0;

      if (wpBatch.length === 0) {
        keepFetching = false;
        console.log("✅ No more pages in WordPress.");
        break;
      }

      // 🛠 استراتژی جدید: مپ کردن بر اساس TITLE
      const batchStockMap = new Map<string, number>();
      wpBatch.forEach((p: any) => {
        const cleanName = normalizeText(p.name);
        batchStockMap.set(cleanName, p.stock_quantity || 0);
      });

      let updatedInBatch = 0;

      // جستجو در محصولات مدوسا
      for (const product of medusaProducts) {
        if (!product.title) continue;
        
        // نرمال‌سازی تایتل مدوسا
        const cleanTitle = normalizeText(product.title);
        
        // آیا این تایتل در لیست وردپرس هست؟
        const wpStock = batchStockMap.get(cleanTitle);

        if (wpStock === undefined) continue;

        // اگر محصول وریانت ندارد
        if (!product.variants || product.variants.length === 0) continue;

        // اعمال موجودی روی وریانت اول
        const targetVariant = product.variants[0];

        try {
            // ساخت SKU موقت اگر ندارد (برای Inventory Item الزامی است)
            let searchSku = targetVariant.sku;
            if (!searchSku) searchSku = `auto-${product.handle}`; 

            // 1. پیدا کردن/ساختن آیتم انبار
            const [existingItems] = await inventoryService.listInventoryItems({ sku: searchSku }, { take: 1 });
            let inventoryItemId = existingItems?.[0]?.id;

            if (!inventoryItemId) {
              const newItem = await inventoryService.createInventoryItems({ 
                  sku: searchSku, 
                  requires_shipping: true 
              });
              inventoryItemId = newItem.id;
            }

            // 2. لینک کردن
            try {
                await remoteLink.create({
                [Modules.PRODUCT]: { variant_id: targetVariant.id },
                [Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
                });
            } catch (e) {}

            // 3. آپدیت عدد موجودی
            const levels = await inventoryService.listInventoryLevels({ inventory_item_id: inventoryItemId, location_id: locationId });

            if (levels.length > 0) {
              await inventoryService.updateInventoryLevels({ inventory_item_id: inventoryItemId, location_id: locationId, stocked_quantity: wpStock });
            } else {
              await inventoryService.createInventoryLevels({ inventory_item_id: inventoryItemId, location_id: locationId, stocked_quantity: wpStock });
            }
            updatedInBatch++;
            totalUpdated++;
            
        } catch (err: any) {
            console.error(`Error syncing ${product.title}:`, err.message);
        }
      }

      console.log(`   -> Updated ${updatedInBatch} items (Matched by Title).`);
      page++;
      
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      consecutiveErrors++;
      const status = error.response ? error.response.status : "Unknown";
      console.error(`❌ Error on page ${page} (Status: ${status}):`, error.message);

      if ([500, 502, 503, 504, 429, 403].includes(status) || error.code === 'ECONNRESET') {
          console.log("🔥 Server overload. Waiting 60s...");
          await new Promise(resolve => setTimeout(resolve, 60000));
          if (consecutiveErrors > 5) keepFetching = false;
      } else {
          keepFetching = false;
      }
    }
  }

  console.log(`🎉 Sync Completed! Total Updated: ${totalUpdated}`);
}