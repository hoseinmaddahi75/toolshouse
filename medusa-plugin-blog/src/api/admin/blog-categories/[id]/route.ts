import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { resolveKnex } from "../../../../lib/db"

interface UpdateBody {
  title: string
  value: string
}

interface DeleteBody {
  move_to?: string
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const knex = resolveKnex(req.scope)
  const { id } = req.params
  const { title, value } = req.body as UpdateBody

  try {
    const oldCat = await knex("blog_categories").where({ id }).first()

    if (!oldCat) {
      res.status(404).json({ message: "Category not found" })
      return
    }

    await knex("blog_categories").where({ id }).update({ title, value })

    if (oldCat.title !== title) {
      await knex("blog_posts")
        .where({ category: oldCat.title })
        .update({ category: title })
    }

    res.json({ message: "Updated" })
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const knex = resolveKnex(req.scope)
  const { id } = req.params
  const { move_to } = req.body as DeleteBody

  try {
    const catToDelete = await knex("blog_categories").where({ id }).first()

    if (!catToDelete) {
      res.status(404).json({ message: "Category not found" })
      return
    }

    if (move_to) {
      await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: move_to })
    } else {
      await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: null })
    }

    await knex("blog_categories").where({ id }).del()
    res.json({ message: "Deleted" })
  } catch (e: any) {
    res.status(400).json({ message: e.message })
  }
}
