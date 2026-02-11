import type { Request, Response } from "express";
import { ContainerRegistrationKeys } from "@medusajs/utils";
// 👇 آدرس درست این است:
import { BlogService } from "../../lib/blog-service";

export async function GET(req: Request, res: Response) {
  try {
    const scope = (req as any).scope;
    const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    
    // ساخت سرویس با آدرس جدید
    const blogService = new BlogService(knex);

    const posts = await blogService.list({ status: "published" });
    
    res.json({ posts });
  } catch (error: any) {
    res.status(500).json({ message: "Error", error: error.message });
  }
}