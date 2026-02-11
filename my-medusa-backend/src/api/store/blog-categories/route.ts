// مسیر: src/api/store/blog-categories/route.ts
import type { Request, Response } from "express";

export async function GET(req: Request, res: Response) {
  try {
    const PostService = (req as any).scope.resolve("PostService");

    // فراخوانی متد جدیدی که اضافه کردیم
    const categories = await PostService.listCategories();

    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
}