// مسیر: src/lib/blog-service.ts
export class BlogService {
  protected knex: any;

  constructor(knexConnection: any) {
    this.knex = knexConnection;
  }

  // لیست کردن
  async list(selector: any = {}) {
    const query = this.knex("blog_posts")
      .select("*")
      .orderBy("created_at", "desc");

    if (selector.status) {
      query.where("status", selector.status);
    }
    return await query;
  }

  // دریافت تکی با ID
  async retrieve(id: string) {
    return await this.knex("blog_posts").where({ id }).first();
  }

  // دریافت تکی با Slug
  async retrieveBySlug(slug: string) {
    return await this.knex("blog_posts").where({ slug }).first();
  }

  // ساخت مقاله
  async create(data: any) {
    const result = await this.knex("blog_posts")
      .insert({
        id: `post_${Date.now()}`,
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
        status: data.status || "draft",
        published_at: data.published_at ? new Date(data.published_at) : new Date(),
      })
      .returning("*");
    return result[0];
  }

  // آپدیت
  async update(id: string, data: any) {
    const result = await this.knex("blog_posts")
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning("*");
    return result[0];
  }

  // حذف
  async delete(id: string) {
    return await this.knex("blog_posts").where({ id }).del();
  }

  // دسته‌بندی‌ها
  async listCategories() {
    const rows = await this.knex("blog_posts")
      .distinct("category")
      .whereNotNull("category")
      .whereNot("category", "");
    
    return rows.map((r: any) => ({
      title: r.category,
      value: r.category
    }));
  }
}