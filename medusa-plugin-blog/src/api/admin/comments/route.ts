import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CommentService } from "../../../lib/comment-service"
import { resolveKnex } from "../../../lib/db"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const commentService = new CommentService(resolveKnex(req.scope))
  const comments = await commentService.listAll()
  res.json({ comments })
}
