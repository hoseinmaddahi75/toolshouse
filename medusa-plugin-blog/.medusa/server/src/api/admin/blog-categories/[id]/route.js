"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.DELETE = DELETE;
const db_1 = require("../../../../lib/db");

async function POST(req, res) {
  const knex = (0, db_1.resolveKnex)(req.scope);
  const { id } = req.params;
  const { title, value } = req.body;
  try {
    const oldCat = await knex("blog_categories").where({ id }).first();
    if (!oldCat) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    await knex("blog_categories").where({ id }).update({ title, value });
    if (oldCat.title !== title) {
      await knex("blog_posts")
        .where({ category: oldCat.title })
        .update({ category: title });
    }
    res.json({ message: "Updated" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}

async function DELETE(req, res) {
  const knex = (0, db_1.resolveKnex)(req.scope);
  const { id } = req.params;
  const { move_to } = req.body || {};
  try {
    const catToDelete = await knex("blog_categories").where({ id }).first();
    if (!catToDelete) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    if (move_to) {
      await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: move_to });
    } else {
      await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: null });
    }
    await knex("blog_categories").where({ id }).del();
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
