import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { BlogService } from "../../../../lib/blog-service";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const blogService = new BlogService(knex);

  try {
    const post = await blogService.retrieve(id);
    res.json({ post });
  } catch (error) {
    res.status(404).json({ message: "Post not found" });
  }
}

// 👇 تغییر مهم: نام تابع را از PUT به POST تغییر دهید
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const blogService = new BlogService(knex);

  try {
    // 1. آپدیت مقاله
    const post = await blogService.update(id, req.body);
    
    // 2. برگرداندن پاسخ موفقیت
    res.json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const blogService = new BlogService(knex);

  try {
    await blogService.delete(id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
}