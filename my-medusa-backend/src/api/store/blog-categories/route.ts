import type { Request, Response } from "express";

export async function GET(req: Request, res: Response) {
  try {
    const postService = (req as any).scope.resolve("postService");

    const categories = await postService.listCategories();

    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
}