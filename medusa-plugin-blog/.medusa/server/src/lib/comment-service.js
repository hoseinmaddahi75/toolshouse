"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

class CommentService {
  constructor(knexConnection) {
    this.knex = knexConnection;
  }

  async create(data) {
    const [comment] = await this.knex("blog_comments")
      .insert({
        id: generateId("cm"),
        post_id: data.post_id,
        author_name: data.author_name,
        content: data.content,
        status: "pending",
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");
    return comment;
  }

  async listByPost(postId) {
    return await this.knex("blog_comments")
      .where({ post_id: postId, status: "approved" })
      .orderBy("created_at", "desc");
  }

  async listAll() {
    return await this.knex("blog_comments")
      .leftJoin("blog_posts", "blog_comments.post_id", "blog_posts.id")
      .select(
        "blog_comments.*",
        "blog_posts.title as post_title",
        "blog_posts.slug as post_slug"
      )
      .orderBy("blog_comments.created_at", "desc");
  }

  async updateStatus(id, status) {
    return await this.knex("blog_comments")
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning("*");
  }

  async delete(id) {
    return await this.knex("blog_comments").where({ id }).del();
  }
}

exports.CommentService = CommentService;
