import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const paymentModuleService = req.scope.resolve(Modules.PAYMENT)

  try {
    // ۱. ساخت یک Payment Collection (ظرف پرداخت)
    const paymentCollection = await paymentModuleService.createPaymentCollections({
      currency_code: "irt",
      amount: 10000, // مبلغ تستی (۱۰,۰۰۰ ریال)
    })

    console.log("🏗️ Collection Created:", paymentCollection.id)

    // ۲. تلاش برای ساخت سشن با شناسه استاندارد مدوسا
    // فرمول: pp_ + آیدی_کانفیگ + _ + آیدی_کلاس
    const providerId = "pp_zarinpal_zarinpal"

    console.log(`🔄 Attempting to create session with ID: ${providerId}...`)

    const paymentSession = await paymentModuleService.createPaymentSession(
      paymentCollection.id,
      {
        provider_id: providerId,
        currency_code: "irt",
        amount: 10000,
        data: {}, // دیتای اضافی (خالی)
        context: { 
            customer: { 
                id: "test-customer-main", 
                email: "admin@tooshouse.com" 
            } 
        }
      } as any 
    )

    // ۳. موفقیت!
    res.json({
      success: true,
      message: "Zarinpal is WORKING in Main Project! 🚀",
      provider_id: providerId,
      payment_url: paymentSession.data.payment_url, // لینک پرداخت (ماک یا واقعی)
      session_data: paymentSession.data
    })

  } catch (error: any) {
    console.error("❌ Test Failed:", error)
    
    // اگر خطا داد، لیست پرووایدرهای ثبت شده رو نشون میدیم تا ببینیم مشکل از اسمه یا چیز دیگه
    const query = req.scope.resolve("query")
    const { data: providers } = await query.graph({
        entity: "payment_provider",
        fields: ["id", "is_active"]
    })

    res.status(500).json({
      error: "Failed to create session",
      message: error.message,
      registered_providers: providers // لیست پرووایدرهایی که مدوسا شناخته
    })
  }
}