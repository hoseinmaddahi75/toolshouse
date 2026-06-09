import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { resolveKnex } from "../../../lib/db"
import type { BlogCategory } from "../../../lib/types"

type CategoryBody = {
  title: string
  value: string
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const knex = resolveKnex(req.scope)
  const categories: BlogCategory[] = await knex("blog_categories").select("*")
  res.json({ categories })
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const knex = resolveKnex(req.scope)
  const { title, value } = req.body as CategoryBody

  try {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const [category] = await knex("blog_categories")
      .insert({ id, title, value })
      .returning("*")

    res.json({ category })
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}
