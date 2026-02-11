// مسیر: src/api/store/blog/route.ts
import type { Request, Response } from "express";
// 👇 ۱. ایمپورت مستقیم کلاس
import { BlogService } from "../../../lib/blog-service"; 
import { ContainerRegistrationKeys } from "@medusajs/utils";

export async function GET(req: Request, res: Response) {
  try {
    const scope = (req as any).scope;

    // 👇 ۲. دریافت کانکشن دیتابیس (این کلید در نسخه ۲ استاندارد است)
    const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);

    // 👇 ۳. ساخت دستی سرویس
    const blogService = new BlogService(knex);

    const posts = await blogService.list({ status: "published" });
    
    res.json({ posts });
  } catch (error: any) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ 
      message: "Error fetching blog posts", 
      error: error.message 
    });
  }
}