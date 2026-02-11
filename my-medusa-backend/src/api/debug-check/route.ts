import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // دسترسی به کانتینر اصلی مدوسا
  const container = req.scope;
  
  // گرفتن تمام کلیدهای ثبت شده
  const allRegistrationKeys = Object.keys(container.registrations);

  // فیلتر کردن کلیدهای مشکوک (مربوط به پرداخت یا زرین‌پال)
  const suspects = allRegistrationKeys.filter((key) => 
    key.toLowerCase().includes("zarin") || 
    key.toLowerCase().includes("pp_") ||
    key.startsWith("payment")
  );

  // ارسال نتیجه به مرورگر
  res.json({
    status: "success",
    found_providers: suspects,
    total_registrations: allRegistrationKeys.length
  });
}