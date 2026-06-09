import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { CommentService } from "../../../../lib/comment-service"
import { resolveKnex } from "../../../../lib/db"

export async function PUT(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const { status } = req.body as { status: "approved" | "pending" }
  const commentService = new CommentService(resolveKnex(req.scope))

  try {
    const updated = await commentService.updateStatus(id, status)
    res.json({ comment: updated[0] })
  } catch {
    res.status(500).json({ message: "Error updating comment" })
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const commentService = new CommentService(resolveKnex(req.scope))

  try {
    await commentService.delete(id)
    res.json({ message: "Comment deleted" })
  } catch {
    res.status(500).json({ message: "Error deleting comment" })
  }
}
