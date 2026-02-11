import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { CommentService } from "../../../lib/comment-service";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const commentService = new CommentService(knex);

  const comments = await commentService.listAll();
  res.json({ comments });
}