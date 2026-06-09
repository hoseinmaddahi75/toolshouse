"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const db_1 = require("../../../lib/db");

async function GET(req, res) {
  const knex = (0, db_1.resolveKnex)(req.scope);
  const categories = await knex("blog_categories").select("*");
  res.json({ categories });
}

async function POST(req, res) {
  const knex = (0, db_1.resolveKnex)(req.scope);
  const { title, value } = req.body;
  try {
    const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const [category] = await knex("blog_categories")
      .insert({ id, title, value })
      .returning("*");
    res.json({ category });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
}
