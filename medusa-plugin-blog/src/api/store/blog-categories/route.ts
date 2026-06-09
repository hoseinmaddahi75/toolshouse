import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { resolveKnex } from "../../../lib/db"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const knex = resolveKnex(req.scope)
    const categories = await knex("blog_categories").select("*")
    res.json({ categories })
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching categories",
      error: error.message,
    })
  }
}
