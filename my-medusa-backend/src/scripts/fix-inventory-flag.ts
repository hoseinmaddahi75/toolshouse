// src/scripts/fix-inventory-flag.ts
import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { IProductModuleService } from "@medusajs/framework/types";

export default async function fixInventoryFlag({ container }: ExecArgs) {
  console.log("🚀 Starting to Enable Inventory Management...");

  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);

  // 1. دریافت تمام محصولات و وریانت‌ها
  const [products, count] = await productService.listAndCountProducts({}, { 
    select: ["id", "title", "variants.id", "variants.manage_inventory", "variants.title"],
    relations: ["variants"],
    take: 10000 
  });

  console.log(`📦 Found ${count} products. Checking variants...`);

  let updatedCount = 0;
  const updates: any[] = [];

  // 2. بررسی و جمع‌آوری وریانت‌هایی که نیاز به اصلاح دارند
  for (const product of products) {
    if (!product.variants) continue;

    for (const variant of product.variants) {
      // اگر قبلاً روشن بود، کاری نداریم
      if (variant.manage_inventory === true) continue;

      // اضافه کردن به لیست آپدیت
      updates.push(
        productService.updateProductVariants(variant.id, {
          manage_inventory: true, // ✅ روشن کردن مدیریت انبار
          allow_backorder: false, // ⛔ عدم اجازه پیش‌خرید (وقتی تمام شد، ناموجود بزند)
        })
      );
      updatedCount++;
    }
  }

  // 3. اجرای آپدیت‌ها (به صورت موازی برای سرعت بیشتر)
  if (updates.length > 0) {
      console.log(`⚙️ Fixing ${updatedCount} variants... (This might take a moment)`);
      await Promise.all(updates);
      console.log("✅ All variants updated successfully!");
  } else {
      console.log("🎉 All variants are already managed. No changes needed.");
  }
}