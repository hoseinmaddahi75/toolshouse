import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");

  try {
    // بررسی وجود جدول
    const hasTable = await knex.schema.hasTable("review");

    if (!hasTable) {
      await knex.schema.createTable("review", (table) => {
        table.string("id").primary(); // شناسه
        table.string("name").notNullable();
        table.string("role").notNullable();
        table.text("content").notNullable();
        table.integer("rating").notNullable();
        table.string("image").nullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      });
      res.json({ message: "✅ جدول review با موفقیت ساخته شد!" });
    } else {
      res.json({ message: "⚠️ جدول review از قبل وجود دارد." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}