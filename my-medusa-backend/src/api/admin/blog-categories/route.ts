import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

// تعریف تایپ برای دیتای ورودی
type CategoryReqBody = {
  title: string;
  value: string;
  id?: string;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");
  const categories = await knex("blog_categories").select("*");
  res.json({ categories });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");
  
  // 👇 اینجا به تایپ‌اسکریپت می‌گوییم بادی چه شکلی است
  const { title, value } = req.body as CategoryReqBody;

  try {
    const [category] = await knex("blog_categories")
      .insert({
        id: `cat_${Date.now()}`,
        title,
        value, 
      })
      .returning("*");
    
    res.json({ category });
  } catch (e: any) { // e: any اضافه شد
    res.status(400).json({ message: e.message });
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const knex = req.scope.resolve("__pg_connection__");
  
  // 👇 اینجا هم تایپ دادیم
  const { id } = req.body as CategoryReqBody; 
  
  // نکته: معمولاً برای DELETE بهتر است از route parameter استفاده کنید (مثل فایل [id])
  // اما برای رفع ارور فعلی، این کد صحیح است.
  if (id) {
      await knex("blog_categories").where({ id }).del();
  }
  
  res.json({ message: "Deleted" });
}