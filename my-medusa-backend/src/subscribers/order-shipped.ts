// مسیر: src/subscribers/order-shipped.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework";
import { sendMelliPayamakPattern } from "../utils/melipayamak-sender";

export default async function trackingCodeAddedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  
  if (!data?.id) return;

  const query = container.resolve("query");

  try {
    // ۱. جستجوی فولفیلمنت بر اساس لیبلِ داخلی خودش
    // چون فولفیلمنت و لیبل در یک ماژول هستند، این فیلتر قطعا و ۱۰۰٪ کار می‌کند
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "order.id", // درخواست برای حل کردن لینکِ سفارش
        "order.shipping_address.phone",
        "order.shipping_address.first_name",
        "order.customer.phone",
        "order.customer.first_name"
      ],
      filters: {
        labels: {
          id: data.id // فیلتر دقیق بر اساس آیدی کد رهگیری که الان ثبت شد
        }
      }
    });

    if (!fulfillments || fulfillments.length === 0) {
        console.log(`⚠️ [DEBUG SMS] Fulfillment not found for label ${data.id}`);
        return;
    }

    // ۲. استخراج سفارش از داخل فولفیلمنت پیدا شده
    const order = fulfillments[0].order;
    if (!order) {
        console.log(`⚠️ [DEBUG SMS] Order not linked to fulfillment ${fulfillments[0].id}`);
        return;
    }

    // ۳. استخراج اطلاعات و ارسال پیامک
    const phone = order.shipping_address?.phone || order.customer?.phone;
    const firstName = order.shipping_address?.first_name || order.customer?.first_name || "کاربر";
    const sendPattern = process.env.SMS_PATTERN_ORDER_SEND;

    if (sendPattern && phone) {
      await sendMelliPayamakPattern(phone, sendPattern, [firstName]);
      console.log(`✅ Order Shipped SMS Delivered to ${firstName} for Order ${order.id}`);
    }

  } catch (error) {
     console.error(`❌ Error in trackingCodeAddedHandler:`, error);
  }
}

export const config: SubscriberConfig = {
  // گوش دادن به رویداد ساخته شدن کد رهگیری (دقیقا همانی که وایرتپِ شما شکار کرد)
  event: "fulfillment.fulfillment-label.created", 
};