import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { CommentService } from "../../../../lib/comment-service";

export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  
  // 👇 تغییر مهم: تعریف تایپ برای req.body
  const { status } = req.body as { status: "approved" | "pending" };
  
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const commentService = new CommentService(knex);

  try {
    const updated = await commentService.updateStatus(id, status);
    res.json({ comment: updated[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating comment" });
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params;
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const commentService = new CommentService(knex);

  try {
    await commentService.delete(id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment" });
  }
}