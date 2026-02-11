import type { Request, Response } from "express";
import { ContainerRegistrationKeys } from "@medusajs/utils";
// 👇 آدرس درست (با ../ بیشتر)
import { BlogService } from "../../../lib/blog-service";

export async function GET(req: Request, res: Response) {
  const { slug } = req.params;
  try {
    const scope = (req as any).scope;
    const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
    
    const blogService = new BlogService(knex);
    const post = await blogService.retrieveBySlug(slug);

    if (!post) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    res.json({ post });
  } catch (error: any) {
    res.status(500).json({ message: "Error", error: error.message });
  }
}