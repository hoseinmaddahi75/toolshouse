// مسیر: src/subscribers/order-placed.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { sendMelliPayamakPattern } from "../utils/melipayamak-sender";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  
  // برای گرفتن دیتای سفارش از ماژول قدرتمند Query استفاده می‌کنیم
  const query = container.resolve("query");

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id", 
      "display_id", 
      "shipping_address.phone", 
      "shipping_address.first_name", 
      "customer.phone", 
      "customer.first_name"
    ],
    filters: { id: data.id },
  });

  if (!orders || orders.length === 0) return;
  const order = orders[0];

  // اولویت با شماره و اسم آدرس ارسال است، اگر نبود از اطلاعات اکانت استفاده می‌کنیم
  const phone = order.shipping_address?.phone || order.customer?.phone;
  const firstName = order.shipping_address?.first_name || order.customer?.first_name || "کاربر";
  const displayId = String(order.display_id);

  // ۱. ارسال پیامک به مشتری (پترن 3520323 : {0} گرامی سفارش شما با کد {1} ثبت شد)
  const userPattern = process.env.SMS_PATTERN_ORDER_USER;
  if (userPattern && phone) {
    try {
      await sendMelliPayamakPattern(phone, userPattern, [firstName, displayId]);
      console.log(`✅ SMS Sent to User for Order ${displayId}`);
    } catch (e) {
      console.error(`❌ Failed to send Order SMS to User:`, e);
    }
  }

  // ۲. ارسال پیامک به ادمین (پترن 2520326 : سفارشی با کد {0} در وب سایت ثبت شد)
  const adminPattern = process.env.SMS_PATTERN_ORDER_ADMIN;
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  if (adminPattern && adminPhone) {
    try {
      await sendMelliPayamakPattern(adminPhone, adminPattern, [displayId]);
      console.log(`✅ SMS Sent to Admin for Order ${displayId}`);
    } catch (e) {
      console.error(`❌ Failed to send Order SMS to Admin:`, e);
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed", // گوش دادن به رویداد ثبت سفارش
};