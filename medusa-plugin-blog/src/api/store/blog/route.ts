import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BlogService } from "../../../lib/blog-service"
import { resolveKnex } from "../../../lib/db"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogService = new BlogService(resolveKnex(req.scope))
    const posts = await blogService.list({ status: "published" })
    res.json({ posts })
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching blog posts",
      error: error.message,
    })
  }
}
