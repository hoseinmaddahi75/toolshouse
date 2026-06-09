import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CommentService } from "../../../../../lib/comment-service"
import { resolveKnex } from "../../../../../lib/db"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const commentService = new CommentService(resolveKnex(req.scope))
  const comments = await commentService.listByPost(id)
  res.json({ comments })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const commentService = new CommentService(resolveKnex(req.scope))

  try {
    const body = req.body as { author_name: string; content: string }
    const comment = await commentService.create({
      post_id: id,
      author_name: body.author_name,
      content: body.content,
    })
    res.json({ comment })
  } catch {
    res.status(500).json({ message: "Error creating comment" })
  }
}
