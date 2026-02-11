import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import Redis from "ioredis";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

  try {
    const { phone, code } = req.body as { phone: string, code: string };

    if (!phone || !code) {
      return res.status(400).json({ message: "اطلاعات ناقص است" });
    }

    // ۱. چک کردن کد از ردیس
    const storedCode = await redis.get(`otp_${phone}`);

    if (!storedCode || storedCode !== code) {
      await redis.disconnect();
      return res.status(401).json({ message: "کد تایید اشتباه یا منقضی شده است" });
    }

    // پاک کردن کد مصرف شده
    await redis.del(`otp_${phone}`);
    await redis.disconnect();

    // ۲. دریافت ماژول مشتری (با کلید صحیح "customer") 👈 تغییر اصلی اینجاست
    const customerModule: any = req.scope.resolve("customer");

    // ۳. پیدا کردن مشتری
    // در ماژول مشتری v2، متد listCustomers برای جستجو استفاده می‌شود
    const rawPhone = phone.replace(/\s+/g, '');
    const phoneWithoutZero = rawPhone.startsWith("0") ? rawPhone.substring(1) : rawPhone;
    
    const phoneVariants = [
      rawPhone,                       // 0992...
      `+98${phoneWithoutZero}`,      // +98992...
      phoneWithoutZero                // 992...
    ];

    const customers = await customerModule.listCustomers({
      phone: [...new Set(phoneVariants)],
    });

    let customer = customers.length > 0 ? customers[0] : null;

    // ۴. ساخت مشتری جدید اگر وجود نداشت
    if (!customer) {
      console.log("Creating new customer in Medusa v2...");
      const newCustomerData = {
        email: `${phone}@toolshouse.ir`, // ایمیل یکتا
        phone: phone,
        first_name: "کاربر",
        last_name: "مهمان",
      };

      // متد createCustomers یک مشتری تکی یا آرایه برمی‌گرداند
      const created = await customerModule.createCustomers(newCustomerData);
      
      // هندل کردن خروجی که ممکن است آرایه یا آبجکت باشد
      customer = Array.isArray(created) ? created[0] : created;
    }

    return res.status(200).json({
      message: "ورود با موفقیت انجام شد",
      customer: {
        id: customer.id,
        phone: customer.phone,
        email: customer.email
      }
    });

  } catch (error: any) {
    console.error("❌ Verify Error:", error);
    // حتما در صورت ارور، کانکشن ردیس بسته شود تا منابع هدر نرود
    if (redis.status === "ready") {
       await redis.disconnect();
    }
    return res.status(500).json({ 
      message: "خطای داخلی سرور", 
      error: error.message 
    });
  }
}