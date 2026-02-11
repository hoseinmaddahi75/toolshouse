// مسیر: src/api/store/blog/[slug]/route.ts
import type { Request, Response } from "express";
import { BlogService } from "../../../../lib/blog-service"; // دقت کنید به تعداد ../
import { ContainerRegistrationKeys } from "@medusajs/utils";

export async function GET(req: Request, res: Response) {
  const { slug } = req.params;

  try {
    const scope = (req as any).scope;
    const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    
    // ساخت دستی سرویس
    const blogService = new BlogService(knex);

    const post = await blogService.retrieveBySlug(slug);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({ post });
  } catch (error: any) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
}