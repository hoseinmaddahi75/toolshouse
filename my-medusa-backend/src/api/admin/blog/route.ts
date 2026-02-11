import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
// 👇 آدرس جدید ایمپورت (تعداد .. کمتر است چون یک پوشه عقب‌تر است)
import { BlogService } from "../../../lib/blog-service";

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const blogService = new BlogService(knex);

  const posts = await blogService.list();
  res.json({ posts });
}

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const scope = req.scope;
  const knex = scope.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const blogService = new BlogService(knex);

  try {
    const post = await blogService.create(req.body);
    res.status(201).json({ post });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
}