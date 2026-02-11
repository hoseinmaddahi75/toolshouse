import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { 
  addShippingMethodToCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow 
} from "@medusajs/medusa/core-flows";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // گرفتن مقادیر از بدنه درخواست
  const { cart_id, shipping_option_id, provider_id } = req.body as any;
  
  // گرفتن شناسه مشتری از هدر (که فرانت‌اِند ارسال می‌کند)
  const customerId = req.headers["x-customer-id"] as string;

  // تعیین درگاه پرداخت
  const TARGET_PROVIDER_ID = provider_id || "pp_zarinpal_zarinpal"; 

  console.log(`🚀 [Checkout Init] Starting for Cart: ${cart_id}`);
  console.log(`👤 [Checkout Init] Customer ID from Header: ${customerId || "Guest"}`);

  try {
    const scope = req.scope;

    // 🟢 گام صفر (جدید): اتصال "پولادین" سبد خرید به مشتری
    // این بخش تضمین می‌کند سفارش به نام کاربر ثبت شود، نه مهمان
    if (customerId) {
        try {
            const cartModule = scope.resolve(Modules.CART);
            
            // آپدیت مستقیم دیتابیس بدون درگیر شدن با ورک‌فلوهای پیچیده
            await cartModule.updateCarts([{
                id: cart_id,
                customer_id: customerId
            }]);
            console.log(`🔗 [Step 0] Cart linked to Customer: ${customerId}`);
        } catch (linkError) {
            console.error("⚠️ [Step 0] Failed to link customer (Proceeding anyway):", linkError);
        }
    }

    // ۱. ثبت روش ارسال
    console.log("📦 [1/4] Adding Shipping Method...");
    await addShippingMethodToCartWorkflow(scope).run({
      input: {
        cart_id,
        options: [{ id: shipping_option_id }],
      },
    });

    // ۲. ایجاد کالکشن پرداخت (اگر نباشد)
    console.log("💰 [2/4] Ensuring Payment Collection...");
    try {
        await createPaymentCollectionForCartWorkflow(scope).run({
            input: { cart_id },
        });
    } catch (e) {
        console.log("ℹ️ Payment Collection likely exists.");
    }

    // ۳. بررسی و اعتبار سنجی
    const query = scope.resolve(ContainerRegistrationKeys.QUERY);
    const { data: carts } = await query.graph({
        entity: "cart",
        fields: ["payment_collection.id", "region.payment_providers.id", "total"],
        filters: { id: cart_id }
    });
    
    const cart = carts[0];
    if (!cart?.payment_collection?.id) throw new Error("Payment Collection Not Found!");

    // --- بخش دیباگ ---
    console.log(`📊 [Debug] Cart Total: ${cart.total}`);
    const availableProviders = cart.region?.payment_providers?.map((p: any) => p.id) || [];
    
    if (!availableProviders.includes(TARGET_PROVIDER_ID)) {
        console.error(`❌ [CRITICAL] Provider '${TARGET_PROVIDER_ID}' is NOT enabled in this region!`);
        console.error(`Allowed:`, availableProviders);
        throw new Error(`Provider ${TARGET_PROVIDER_ID} is not allowed in this region.`);
    }
    // ----------------

    // ۴. ساخت سشن پرداخت
    console.log(`🔄 [3/4] Creating Payment Session for ${TARGET_PROVIDER_ID}...`);
    
    const { result, errors } = await createPaymentSessionsWorkflow(scope).run({
      input: {
        payment_collection_id: cart.payment_collection.id,
        provider_id: TARGET_PROVIDER_ID,
      },
      throwOnError: false
    });

    if (errors && errors.length > 0) {
        console.error("❌ [Workflow Error]:", JSON.stringify(errors, null, 2));
        throw new Error("Workflow failed to create session");
    }

    console.log("✅ [4/4] Checkout Initialized Successfully!");
    
    // نتیجه نهایی را برمی‌گردانیم (شامل لینک پرداخت زرین‌پال در بخش data)
    return res.json({ success: true, message: "Checkout initialized", result });

  } catch (error: any) {
    console.error("❌ [Checkout Init Failed]:", error.message);
    return res.status(500).json({ 
        message: "خطا در آماده‌سازی سبد خرید", 
        details: error.message
    });
  }
}