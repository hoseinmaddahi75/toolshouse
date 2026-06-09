import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../../lib/blog-service"
import { resolveKnex } from "../../../../lib/db"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { slug } = req.params

  try {
    const blogService = new BlogService(resolveKnex(req.scope))
    const post = await blogService.retrieveBySlug(slug)

    if (!post) {
      res.status(404).json({ message: "Post not found" })
      return
    }

    res.json({ post })
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching post", error: error.message })
  }
}
