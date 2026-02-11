// مسیر: src/lib/comment-service.ts
export class CommentService {
  protected knex: any;

  constructor(knexConnection: any) {
    this.knex = knexConnection;
  }

  // ایجاد نظر (پیش‌فرض: در انتظار تایید)
  async create(data: any) {
    const result = await this.knex("blog_comments")
      .insert({
        id: `cm_${Date.now()}`,
        post_id: data.post_id,
        author_name: data.author_name,
        content: data.content,
        // 👇 تغییر مهم: پیش‌فرض روی pending
        status: "pending", 
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning("*");
    return result[0];
  }

  // فقط نظرات تایید شده را برای کاربران سایت برمی‌گرداند
  async listByPost(postId: string) {
    return await this.knex("blog_comments")
      .where({ post_id: postId, status: "approved" }) // فقط تایید شده‌ها
      .orderBy("created_at", "desc");
  }

  // برای ادمین: همه نظرات را برمی‌گرداند
  async listAll() {
    return await this.knex("blog_comments")
      // 👇 اتصال به جدول پست‌ها
      .leftJoin("blog_posts", "blog_comments.post_id", "blog_posts.id")
      .select(
        "blog_comments.*", // همه اطلاعات نظر
        "blog_posts.title as post_title", // عنوان مقاله
        "blog_posts.slug as post_slug"    // اسلاگ (برای لینک دادن)
      )
      .orderBy("blog_comments.created_at", "desc");
  }

  // 👇 متد جدید: تغییر وضعیت (تایید/رد)
  async updateStatus(id: string, status: "approved" | "pending") {
    return await this.knex("blog_comments")
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning("*");
  }

  // 👇 متد جدید: حذف نظر
  async delete(id: string) {
    return await this.knex("blog_comments").where({ id }).del();
  }
}