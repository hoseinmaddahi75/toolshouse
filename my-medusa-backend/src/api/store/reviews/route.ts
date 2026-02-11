import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ReviewService from "../../../services/review";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // ۱. دریافت اتصال دیتابیس (همان کاری که در ادمین کردیم)
    const pg_connection = req.scope.resolve("__pg_connection__");
    
    // ۲. ساخت دستی سرویس
    const reviewService = new ReviewService({ __pg_connection__: pg_connection });
    
    // ۳. دریافت لیست
    const reviews = await reviewService.list();
    
    res.json({ reviews });
  } catch (error) {
    console.error("Store Review Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}