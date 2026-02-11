import type { Request, Response } from "express";

export async function GET(req: Request, res: Response) {
  try {
    const container = (req as any).scope;
    
    // 1. دریافت مستقیم کانکشن دیتابیس (بدون نیاز به سرویس بلاگ)
    // این کانکشن همیشه در مدوسا وجود دارد
    const knex = container.resolve("__pg_connection__");

    console.log("🔌 Connected to DB directly. Creating table...");

    // 2. اجرای SQL
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        published_at TIMESTAMPTZ,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT,
        excerpt TEXT,
        image TEXT,
        category VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        seo_title VARCHAR(255),
        seo_desc TEXT
      );
    `);

    res.json({ message: "✅ Table 'blog_posts' created successfully using Direct Connection!" });
  } catch (error: any) {
    console.error("Setup Error:", error);
    res.status(500).json({ 
      error: "Failed to create table", 
      details: error.message || error.toString() 
    });
  }
}