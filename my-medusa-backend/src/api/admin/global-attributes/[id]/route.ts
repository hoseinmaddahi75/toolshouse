import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/utils";

// 1. هندلر OPTIONS برای حل مشکل CORS
export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
}

// 2. هندلر POST برای ویرایش (Update)
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // تنظیم هدرهای CORS
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const { id } = req.params;
  const { title, values } = req.body as any;
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any;

  try {
    await knex.transaction(async (trx: any) => {
      // الف) آپدیت عنوان ویژگی
      await trx("global_attributes")
        .where({ id })
        .update({
          title: title,
          handle: title.toLowerCase().replace(/\s+/g, "-"),
        });

      // ب) آپدیت مقادیر (حذف قبلی‌ها و درج جدیدها)
      // 1. پاک کردن مقادیر قدیمی
      await trx("global_attribute_values").where({ attribute_id: id }).delete();

      // 2. درج مقادیر جدید
      if (values && values.length > 0) {
        const valueInserts = values.map((v: string) => ({
          id: `val_${Math.floor(Math.random() * 100000000)}`,
          attribute_id: id,
          value: v
        }));
        await trx("global_attribute_values").insert(valueInserts);
      }
    });

    res.json({ message: "Updated successfully", id });
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
}

// 3. هندلر DELETE برای حذف
// 3. هندلر DELETE (هوشمند و با جزئیات)
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  // تنظیم هدرهای CORS
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const { id } = req.params;
  const knex = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any;

  try {
    // 1. پیدا کردن خود ویژگی
    const attribute = await knex("global_attributes").where({ id }).first();
    if (!attribute) {
      return res.status(404).json({ message: "ویژگی یافت نشد" });
    }

    // 2. چک کردن استفاده در محصولات (فقط محصولات زنده و حذف نشده)
    const usedInProducts = await knex("product_option")
      .join("product", "product_option.product_id", "product.id") // اتصال به جدول محصولات
      .where("product_option.title", attribute.title) // نام ویژگی یکی باشد
      .whereNull("product.deleted_at") // 👈 مهم: محصول حذف نشده باشد
      .select("product.title") // فقط نام محصول را بردار
      .limit(5); // حداکثر ۵ تا را نمایش بده که پیام شلوغ نشود

    if (usedInProducts.length > 0) {
      // ساخت لیست نام‌ها برای نمایش به کاربر
      const productNames = usedInProducts.map((p: any) => p.title).join("، ");
      
      return res.status(400).json({ 
        message: `این ویژگی قابل حذف نیست زیرا در محصولات زیر استفاده شده است: \n ${productNames}`,
        code: "CONSTRAINT_VIOLATION" 
      });
    }

    // 3. حذف نهایی (درون تراکنش)
    await knex.transaction(async (trx: any) => {
      await trx("global_attribute_values").where({ attribute_id: id }).delete();
      await trx("global_attributes").where({ id }).delete();
    });

    res.json({ message: "ویژگی با موفقیت حذف شد", id });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
}