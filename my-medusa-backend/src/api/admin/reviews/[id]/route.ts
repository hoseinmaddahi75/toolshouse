import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ReviewService from "../../../../services/review"; // مسیر را دقت کنید (۴ پله عقب)

// آپدیت کردن (POST)
export async function POST(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const pg_connection = req.scope.resolve("__pg_connection__");
  const reviewService = new ReviewService({ __pg_connection__: pg_connection });
  
  // در نسخه ۲، پارامترهای URL در req.params هستند
  const { id } = req.params; 

  const updatedReview = await reviewService.update(id, req.body);
  res.json({ review: updatedReview });
}

// حذف کردن (DELETE)
export async function DELETE(
  req: MedusaRequest, 
  res: MedusaResponse
) {
  const pg_connection = req.scope.resolve("__pg_connection__");
  const reviewService = new ReviewService({ __pg_connection__: pg_connection });
  
  const { id } = req.params;

  await reviewService.delete(id);
  res.json({ message: "Deleted" });
}