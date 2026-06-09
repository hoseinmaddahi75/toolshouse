import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { BlogService } from "../../../../lib/blog-service"
import { resolveKnex } from "../../../../lib/db"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const blogService = new BlogService(resolveKnex(req.scope))

  try {
    const post = await blogService.retrieve(id)
    if (!post) {
      res.status(404).json({ message: "Post not found" })
      return
    }
    res.json({ post })
  } catch {
    res.status(404).json({ message: "Post not found" })
  }
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const blogService = new BlogService(resolveKnex(req.scope))

  try {
    const post = await blogService.update(id, req.body as any)
    res.json({ post })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error updating post" })
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const blogService = new BlogService(resolveKnex(req.scope))

  try {
    await blogService.delete(id)
    res.json({ message: "Post deleted" })
  } catch {
    res.status(500).json({ message: "Error deleting post" })
  }
}
