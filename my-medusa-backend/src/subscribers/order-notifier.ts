import { 
  type SubscriberConfig, 
  type SubscriberArgs, 
} from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { sendFarazPattern } from "../utils/faraz-sender";

export default async function orderNotifier({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  
  const orderModule: any = container.resolve(Modules.ORDER);
  const orderId = data.id;

  // ✅ اصلاح مهم: حذف "customer" از رلیشن‌ها
  // در نسخه ۲، اطلاعات تماس در shipping_address موجود است
  const order = await orderModule.retrieveOrder(orderId, {
    relations: ["shipping_address"], 
  });

  console.log(`📦 Order placed: ${order.display_id}`);

  // دریافت شماره موبایل از آدرس حمل‌ونقل (مطمئن‌ترین جا)
  const customerPhone = order.shipping_address?.phone;
  
  // تنظیمات ادمین
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  const userPattern = process.env.SMS_PATTERN_ORDER_USER;
  const adminPattern = process.env.SMS_PATTERN_ORDER_ADMIN;

  // ۱. پیامک به مشتری
  if (customerPhone && userPattern) {
    const firstName = order.shipping_address?.first_name || "کاربر";
    const lastName = order.shipping_address?.last_name || "گرامی";
    const fullName = `${firstName} ${lastName}`;

    try {
        await sendFarazPattern(customerPhone, userPattern, {
          user_name: fullName,
        });
        console.log(`✅ SMS sent to user (${customerPhone})`);
    } catch (e) {
        console.error("❌ Failed to send user SMS", e);
    }
  }

  // ۲. پیامک به مدیر
  if (adminPhone && adminPattern) {
    try {
        await sendFarazPattern(adminPhone, adminPattern, {
          ticket_id: String(order.display_id),
        });
        console.log(`✅ SMS sent to admin (${adminPhone})`);
    } catch (e) {
        console.error("❌ Failed to send admin SMS", e);
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};