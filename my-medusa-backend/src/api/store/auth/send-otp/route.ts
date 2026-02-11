import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"; // ✅ ایمپورت درست برای V2
import { sendFarazPattern } from "../../../../utils/faraz-sender"; // ✅ اصلاح مسیر (۴ تا نقطه)
import Redis from "ioredis";

// اتصال به ردیس
const redis = new Redis(process.env.REDIS_URL as string);

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.body as { phone: string }; // ✅ تعیین تایپ بادی

  if (!phone) {
    return res.status(400).json({ message: "شماره موبایل الزامی است" });
  }

  // 1. تولید کد ۵ رقمی
  const code = Math.floor(10000 + Math.random() * 90000).toString();

  // 2. ذخیره در ردیس
  await redis.set(`otp_${phone}`, code, "EX", 120);

  // 3. ارسال پیامک
  const pattern = process.env.SMS_PATTERN_OTP;
  if (pattern) {
    await sendFarazPattern(phone, pattern, {
      code: code,
    });
  } else {
    console.warn("⚠️ OTP Pattern not set in .env");
  }

  return res.json({ 
    message: "کد تایید ارسال شد", 
    phone 
  });
}