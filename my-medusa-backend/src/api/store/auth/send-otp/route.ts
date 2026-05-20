import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { sendMelliPayamakPattern } from "../../../../utils/melipayamak-sender";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL as string);

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { phone } = req.body as { phone: string };

  if (!phone) {
    return res.status(400).json({ message: "شماره موبایل الزامی است" });
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  await redis.set(`otp_${phone}`, code, "EX", 120);

  const pattern = process.env.SMS_PATTERN_OTP;
  
  if (pattern) {
    try {
      await sendMelliPayamakPattern(phone, pattern, { code: code });
    } catch (err) {
      console.error("خطا در ارسال پیامک", err);
    }
  } else {
    console.warn("⚠️ OTP Pattern not set in .env");
  }

  return res.json({ message: "کد تایید ارسال شد", phone });
}