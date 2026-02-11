import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ReviewService from "../../../services/review";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // ۱. دریافت کانکشن دیتابیس
  const pg_connection = req.scope.resolve("__pg_connection__");
  
  // ۲. ساخت سرویس با پاس دادن کانکشن
  const reviewService = new ReviewService({ __pg_connection__: pg_connection });
  
  const reviews = await reviewService.list();
  res.json({ reviews });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const pg_connection = req.scope.resolve("__pg_connection__");
  
  const reviewService = new ReviewService({ __pg_connection__: pg_connection });
  
  const review = await reviewService.create(req.body);
  res.json({ review });
}