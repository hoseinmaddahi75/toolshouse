import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { authority, amount } = req.query

  // یک صفحه HTML ساده که شبیه درگاه بانک است
  const html = `
    <div dir="rtl" style="font-family: Tahoma; text-align: center; padding: 50px; background: #f4f4f4; height: 100vh;">
      <div style="background: white; padding: 30px; border-radius: 15px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h1 style="color: #2563eb;">درگاه پرداخت فرضی (تست)</h1>
        <p>مبلغ قابل پرداخت: <b>${amount} تومان</b></p>
        <p>شناسه پرداخت: <code>${authority}</code></p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
        <div style="display: flex; gap: 10px; justify-content: center;">
          <a href="/zarinpal/verify?Status=OK&Authority=${authority}" 
             style="background: #16a34a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
             ✅ پرداخت موفقیت‌آمیز
          </a>
          <a href="/zarinpal/verify?Status=NOK&Authority=${authority}" 
             style="background: #dc2626; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
             ❌ انصراف از پرداخت
          </a>
        </div>
      </div>
    </div>
  `
  res.setHeader("Content-Type", "text/html")
  res.send(html)
}