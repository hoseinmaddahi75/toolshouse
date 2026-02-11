import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// تایپ بادی درخواست
interface UpdateBody {
  title: string;
  value: string;
}

interface DeleteBody {
  move_to?: string; // تایتل دسته‌بندی مقصد
}

// ویرایش دسته‌بندی
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");
  const { id } = req.params;
  const { title, value } = req.body as UpdateBody;

  try {
    // 1. پیدا کردن نام قدیمی برای آپدیت کردن پست‌ها
    const oldCat = await knex("blog_categories").where({ id }).first();

    if (!oldCat) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // 2. آپدیت خود دسته‌بندی
    await knex("blog_categories")
      .where({ id })
      .update({ title, value });

    // 3. آپدیت تمام پست‌هایی که از نام قدیمی استفاده می‌کردند
    if (oldCat.title !== title) {
      await knex("blog_posts")
        .where({ category: oldCat.title })
        .update({ category: title });
    }

    res.json({ message: "Updated" });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}

// حذف دسته‌بندی
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");
  const { id } = req.params;
  const { move_to } = req.body as DeleteBody;

  try {
    // 1. پیدا کردن نام دسته‌بندی که قرار است حذف شود
    const catToDelete = await knex("blog_categories").where({ id }).first();
    
    if (!catToDelete) {
        res.status(404).json({ message: "Category not found" });
        return;
    }

    // 2. اگر دسته‌بندی مقصد انتخاب شده، پست‌ها را منتقل کن
    if (move_to) {
      await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: move_to });
    } else {
        // اگر مقصدی انتخاب نشده، پست‌ها بی دسته‌بندی میشوند (یا با همان نام می‌مانند که بعدا مشکل‌ساز است)
        // بهتر است null کنیم یا به "عمومی" ببریم. اینجا فعلا null می‌کنیم.
        await knex("blog_posts")
        .where({ category: catToDelete.title })
        .update({ category: null });
    }

    // 3. حذف دسته‌بندی
    await knex("blog_categories").where({ id }).del();

    res.json({ message: "Deleted" });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
}