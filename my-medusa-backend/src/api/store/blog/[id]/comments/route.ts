// مسیر: src/api/store/blog/[id]/comments/route.ts
import type { Request, Response } from "express";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { CommentService } from "../../../../../lib/comment-service"; // آدرس را چک کنید

export async function GET(req: Request, res: Response) {
  const { id } = req.params; // این id همان post_id است
  const scope = (req as any).scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const commentService = new CommentService(knex);

  const comments = await commentService.listByPost(id);
  res.json({ comments });
}

export async function POST(req: Request, res: Response) {
  const { id } = req.params;
  const scope = (req as any).scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const commentService = new CommentService(knex);

  try {
    const comment = await commentService.create({
      post_id: id,
      author_name: req.body.author_name,
      content: req.body.content,
    });
    res.json({ comment });
  } catch (error) {
    res.status(500).json({ message: "Error creating comment" });
  }
}