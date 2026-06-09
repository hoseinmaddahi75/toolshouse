"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

class BlogService {
  constructor(knexConnection) {
    this.knex = knexConnection;
  }

  async list(selector = {}) {
    const query = this.knex("blog_posts")
      .select("*")
      .orderBy("created_at", "desc");
    if (selector.status) {
      query.where("status", selector.status);
    }
    return await query;
  }

  async retrieve(id) {
    return await this.knex("blog_posts").where({ id }).first();
  }

  async retrieveBySlug(slug) {
    return await this.knex("blog_posts")
      .where({ slug, status: "published" })
      .first();
  }

  async create(data) {
    const status = data.status || "draft";
    const [post] = await this.knex("blog_posts")
      .insert({
        id: generateId("post"),
        created_at: new Date(),
        updated_at: new Date(),
        title: data.title,
        slug: data.slug,
        seo_title: data.seo_title,
        seo_desc: data.seo_desc,
        content: data.content,
        excerpt: data.excerpt,
        category: data.category,
        image: data.image,
        status,
        published_at:
          status === "published"
            ? data.published_at
              ? new Date(data.published_at)
              : new Date()
            : null,
      })
      .returning("*");
    return post;
  }

  async update(id, data) {
    const updatePayload = { ...data, updated_at: new Date() };

    if (data.status === "published") {
      const existing = await this.retrieve(id);
      if (!existing?.published_at) {
        updatePayload.published_at = new Date();
      }
    }

    const [post] = await this.knex("blog_posts")
      .where({ id })
      .update(updatePayload)
      .returning("*");
    return post;
  }

  async delete(id) {
    return await this.knex("blog_posts").where({ id }).del();
  }
}

exports.BlogService = BlogService;
