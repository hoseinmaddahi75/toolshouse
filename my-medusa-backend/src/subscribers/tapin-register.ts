// مسیر فایل: my-medusa-backend/src/subscribers/tapin-register.ts

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { Modules } from "@medusajs/utils"

export default async function registerTapinOrderHandler({
  event, 
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger");
  const orderId = event.data.id;

  try {
    logger.info(`[تاپین] دریافت رویداد ثبت سفارش برای سفارش: ${orderId}`);

    // ۱. دریافت ماژول سفارشات مدوسا نسخه 2
    const orderModule = container.resolve(Modules.ORDER);
    
    // ۲. استخراج دیتای سفارش (فقط فیلدهایی که در ماژول سفارشات وجود دارند)
    const order = await orderModule.retrieveOrder(orderId, {
      relations: ["shipping_address", "items", "shipping_methods"]
    });

    if (!order) {
        logger.error(`[تاپین] سفارش ${orderId} یافت نشد.`);
        return;
    }

    // ۳. بررسی شیوه ارسال
    const shippingMethodName = order.shipping_methods?.[0]?.name?.toLowerCase() || "";
    
    // اگر سفارش پیک موتوری است، نیازی به ثبت در پلتفرم پستی تاپین نیست
    if (shippingMethodName.includes("پیک") || shippingMethodName.includes("peyk")) {
        logger.info(`[تاپین] سفارش ${orderId} با پیک موتوری است. رد شدن از ثبت تاپین.`);
        return;
    }

    let orderType = 1; // 1 = پست پیشتاز (پیش‌فرض)
    if (shippingMethodName.includes("تیپاکس") || shippingMethodName.includes("tipax")) {
        orderType = 3; // 3 = تیپاکس
    }

    const address = order.shipping_address;
    if (!address) {
        logger.error(`[تاپین] سفارش ${orderId} آدرس پستی ندارد.`);
        return;
    }

    // ۴. دریافت توکن‌های تاپین از فایل .env بک‌اند
    const tapinToken = process.env.TAPIN_TOKEN || "";
    const tapinShopId = process.env.TAPIN_SHOP_ID || "";
    if (!tapinToken || !tapinShopId) {
        logger.error("[تاپین] توکن یا شناسه فروشگاه تاپین در فایل .env بک‌اند تنظیم نشده است!");
        return;
    }
    const authHeader = tapinToken.toLowerCase().startsWith("jwt") ? tapinToken : `Bearer ${tapinToken}`;

    // ۵. دریافت شهر و استان از سرور تاپین و مپ کردن هوشمند کدها
    const locRes = await fetch("https://api.tapin.ir/api/v2/public/state/tree/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": authHeader },
        body: JSON.stringify({})
    });
    const locData = await locRes.json();
    const locations = locData?.entries || [];

    let realProvinceCode = 1;
    let realCityCode = 1;

    // تابع کمکی برای پاکسازی کلمات اضافه و فاصله‌ها جهت مقایسه دقیق‌تر
    const cleanText = (text: string) => {
        if (!text) return "";
        return text.replace(/استان|شهرستان|شهر/g, "").replace(/\s+/g, "").trim();
    };

    if (address.province && address.city) {
        const userProvClean = cleanText(address.province);
        const userCityClean = cleanText(address.city);

        const matchedProv = locations.find((p: any) => 
            cleanText(p.name) === userProvClean || cleanText(p.title) === userProvClean
        );
        
        if (matchedProv) {
            realProvinceCode = matchedProv.id || matchedProv.code || 1;
            const cityList = matchedProv.cities || matchedProv.towns || matchedProv.counties || [];
            
            const matchedCity = cityList.find((c: any) => 
                cleanText(c.name) === userCityClean || cleanText(c.title) === userCityClean
            );
            
            if (matchedCity) {
                realCityCode = matchedCity.id || matchedCity.code || 1;
            } else {
                logger.warn(`[تاپین] شهر ${address.city} در استان ${address.province} یافت نشد. استفاده از پیش‌فرض.`);
            }
        } else {
            logger.warn(`[تاپین] استان ${address.province} در لیست تاپین یافت نشد. استفاده از پیش‌فرض تهران.`);
        }
    }

    // ۶. آماده‌سازی محصولات (تبدیل به تومان)
    const products = order.items.map((item: any) => {
        const weight = item.variant?.weight || item.variant?.product?.weight || 1000;
        return {
            count: item.quantity,
            discount: 0,
            price: Math.round(item.unit_price),
            title: item.title,
            weight: weight > 0 ? weight : 1000,
            product_id: null
        };
    });
    const totalWeight = products.reduce((acc: number, p: any) => acc + (p.weight * p.count), 0);

    // ۷. ساخت Payload و ارسال به API ثبت سفارش تاپین
    const payload = {
        register_type: 0,
        shop_id: tapinShopId,
        address: address.address_1 || "آدرس وارد نشده",
        province_code: realProvinceCode,
        city_code: realCityCode,
        description: `سفارش سایت - کد: ${order.display_id || order.id}`,
        email: order.email || "info@toolshouse.ir",
        employee_code: -1,
        first_name: address.first_name || "مشتری",
        last_name: address.last_name || "عزیز",
        mobile: address.phone || "09120000000",
        phone: address.phone || "02100000000",
        postal_code: address.postal_code || "1111111111",
        pay_type: 2, // 2 = پس کرایه (الزامی برای شما)
        order_type: orderType,
        package_weight: totalWeight > 0 ? totalWeight : 1000,
        packet_type: 2,
        box_id: 10,
        has_insurance: false,
        content_type: 1,
        manual_id: order.id,
        products: products
    };

    const tapinRes = await fetch("https://api.tapin.ir/api/v2/public/order/post/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": authHeader },
        body: JSON.stringify(payload)
    });

    const result = await tapinRes.json();
    if (tapinRes.ok && result?.returns?.status === 200) {
        logger.info(`✅ [تاپین] سفارش ${orderId} با موفقیت در تاپین ثبت شد. کد ره‌گیری: ${result.entries?.tracking_code || '---'}`);
    } else {
        logger.error(`❌ [تاپین] خطا در ثبت سفارش ${orderId}: ${result?.returns?.message}`);
        console.error("Tapin Error Details:", result);
    }

  } catch (err) {
      logger.error(`❌ [تاپین] خطای سیستمی هنگام ثبت سفارش ${orderId}:`, err);
  }
}

// این تنظیمات به مدوسا می‌گوید که دقیقاً کِی این تابع را اجرا کند
export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "tapin-order-registration",
  },
}