export default class ReviewService {
  protected knex_: any

  constructor(container) {
    this.knex_ = container.__pg_connection__
  }

  async list() {
    return await this.knex_("review").select("*").orderBy("created_at", "desc")
  }

  async create(data) {
    const result = await this.knex_("review")
      .insert({
        id: `review_${Date.now()}`,
        created_at: new Date(),
        updated_at: new Date(),
        name: data.name,
        role: data.role,
        content: data.content,
        rating: data.rating,
        image: data.image || null // ذخیره لینک تصویر
      })
      .returning("*")
    return result[0]
  }

  // --- متدهای جدید ---
  async update(id, data) {
    const result = await this.knex_("review")
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning("*")
    return result[0]
  }

  async delete(id) {
    return await this.knex_("review").where({ id }).del()
  }
}