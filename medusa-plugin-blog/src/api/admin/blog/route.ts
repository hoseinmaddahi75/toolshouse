import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { BlogService } from "../../../lib/blog-service"
import { resolveKnex } from "../../../lib/db"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const blogService = new BlogService(resolveKnex(req.scope))
  const posts = await blogService.list()
  res.json({ posts })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const blogService = new BlogService(resolveKnex(req.scope))

  try {
    const post = await blogService.create(req.body as any)
    res.status(201).json({ post })
  } catch (error: any) {
    res.status(500).json({ message: "Error creating post", error: error.message })
  }
}
