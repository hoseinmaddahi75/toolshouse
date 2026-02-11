import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");

  try {
    const hasTable = await knex.schema.hasTable("blog_posts");

    if (!hasTable) {
      await knex.schema.createTable("blog_posts", (table) => {
        table.string("id").primary();
        table.string("title").notNullable(); // عنوان
        table.string("slug").unique().notNullable(); // آدرس سئو (انگلیسی)
        table.string("seo_title").nullable(); // تایتل سئو
        table.text("seo_desc").nullable(); // دسکریپشن سئو
        table.text("content").nullable(); // متن کامل مقاله
        table.text("excerpt").nullable(); // خلاصه متن
        table.string("category").nullable(); // دسته‌بندی
        table.string("image").nullable(); // تصویر شاخص
        table.string("status").defaultTo("draft"); // وضعیت: draft یا published
        table.timestamp("published_at").nullable(); // تاریخ انتشار
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
      res.json({ message: "✅ جدول blog_posts با موفقیت ساخته شد!" });
    } else {
      res.json({ message: "⚠️ جدول از قبل وجود دارد." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}